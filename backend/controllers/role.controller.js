// Example: controllers/role.controller.js
const RestController = require("../helpers/rest.controller");
const Role = require("../models/role.model");

module.exports = new RestController(Role, { softDelete: false }).getMethods();

// Or with explicit variable for clarity
const roleInstance = new RestController(Role, { softDelete: false });
module.exports = roleInstance.getMethods();
