const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const AuthUserToken = require("../models/auth.model"); // updated import

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      user, // entire user object
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ user_id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};

const login = async (req, res) => {
  try {
    const { user_id, email, password } = req.body;

    const query = user_id
      ? { user_id, status: "active" }
      : { email: email.toLowerCase(), status: "active" };

    const user = await User.findOne(query).lean(); // get plain JS object
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    delete user.password; // remove password from user object

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id);

    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save token document
    await AuthUserToken.create({
      user_id: user._id,
      user_name: user.name,
      access_token: accessToken,
      refresh_token: refreshToken,
      expire_time: accessExpiry,
      refresh_time: refreshExpiry,
      token_status: "active",
      created_by: user.user_id,
      updated_by: user.user_id,
    });

    return res.status(200).json({
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: accessExpiry,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const tokenDoc = await AuthUserToken.findOne({ refresh_token });
    if (!tokenDoc || tokenDoc.token_status !== "active")
      return res.status(401).json({ message: "Invalid refresh token" });

    jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(tokenDoc.user_id).lean();
    if (!user || user.status !== "active")
      return res.status(401).json({ message: "User not found or inactive" });

    delete user.password;

    const newAccessToken = generateAccessToken(user);
    const newExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await AuthUserToken.updateOne(
      { _id: tokenDoc._id },
      {
        access_token: newAccessToken,
        expire_time: newExpiry,
        updated_by: user.user_id,
        updated_date: new Date(),
        token_status: "active", // keep active on refresh
      }
    );

    return res.status(200).json({
      access_token: newAccessToken,
      expires_at: newExpiry,
    });
  } catch (error) {
    console.error("REFRESH ERROR:", error);
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

const revoke = async (req, res) => {
  try {
    const { access_token } = req.body;

    // Mark token as revoked instead of deleting
    const tokenDoc = await AuthUserToken.findOne({ access_token });
    if (!tokenDoc) return res.status(404).json({ message: "Token not found" });

    tokenDoc.token_status = "revoked";
    tokenDoc.updated_date = new Date();
    await tokenDoc.save();

    return res.status(200).json({
      message: "Token revoked successfully",
    });
  } catch (error) {
    console.error("REVOKE ERROR:", error);
    return res.status(500).json({ message: "Failed to revoke token" });
  }
};

module.exports = {
  login,
  refreshToken,
  revoke,
};
