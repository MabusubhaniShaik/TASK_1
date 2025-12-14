// controllers/user.controller.js
const RestController = require("../helpers/rest.controller");
const User = require("../models/user.model");

const userController = new RestController(User);

module.exports = userController.getMethods();
