const getExample = (req, res) => {
  res.json({ message: "This is an example endpoint!" });
};

module.exports = { getExample };
