const express = require("express");
const router = express.Router();

const {
  login,
  refreshToken,
  revoke,
} = require("../controllers/auth.controller");

router.post("/auth/token", login);

router.post("/auth/refresh", refreshToken);

router.post("/auth/revoke", revoke);

module.exports = router;
