// src/seed/users.seed.js
require("dotenv").config();

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const { connectDB } = require("../config/db");
const User = require("../models/user.model");
const Role = require("../models/role.model");

class UserSeeder {
  constructor() {
    this.roles = [];
    this.roleMap = {};
    faker.locale = "en_IND";
  }

  async connectDB() {
    await connectDB();
    console.log("Database connected");
  }

  async loadRoles() {
    this.roles = await Role.find({ is_active: true });

    this.roles.forEach((r) => {
      this.roleMap[r.role_code] = r;
    });

    console.log("Roles loaded");
  }

  async generateUserId(roleCode) {
    const year = new Date().getFullYear();

    const count = await User.countDocuments({
      user_id: new RegExp(`^${roleCode}${year}`),
    });

    return `${roleCode}${year}${String(count + 1).padStart(3, "0")}`;
  }

  generateCommonData() {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      contact: {
        phone: faker.phone.number("+91##########"),
        alternate_phone: faker.phone.number("+91##########"),
      },
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        pincode: faker.location.zipCode("######"),
        country: "India",
      },
      profile_image_url: faker.image.avatar(),
    };
  }

  async createUser({ role_code, details }) {
    const role = this.roleMap[role_code];
    if (!role) throw new Error(`Role not found: ${role_code}`);

    const user_id = await this.generateUserId(role_code);
    const common = this.generateCommonData();

    const password = await bcrypt.hash("Password@123", 10);

    const user = await User.create({
      user_id,
      name: common.name,
      email: common.email,
      password,
      role_id: role.id,
      role_name: role.name,
      profile_image_url: common.profile_image_url,
      contact: common.contact,
      address: common.address,
      details,
      status: "active",
      created_by: "system",
      updated_by: "system",
    });

    console.log(`Created ${role_code}: ${user.user_id}`);
    return user;
  }

  async createAdmin() {
    const existing = await User.findOne({ role_name: "Admin" });
    if (existing) return console.log("⚠️ Admin already exists");

    await this.createUser({
      role_code: "ADM",
      details: {
        admin: {
          admin_code: "SUPER_ADMIN",
          permissions: ["ALL"],
        },
      },
    });
  }

  async createDealer() {
    const existing = await User.findOne({ role_name: "Dealer" });
    if (existing) return console.log("⚠️ Dealer already exists");

    await this.createUser({
      role_code: "DLR",
      details: {
        dealer: {
          dealer_code: "DLR_MAIN",
          business_name: faker.company.name(),
          gst_number: `27${faker.string.alphanumeric(10).toUpperCase()}1Z5`,
        },
      },
    });
  }

  async createCustomers(count = 5) {
    for (let i = 0; i < count; i++) {
      await this.createUser({
        role_code: "CUS",
        details: {
          customer: {
            customer_id: `CUST-${faker.number.int({ min: 1000, max: 9999 })}`,
            customer_type: faker.helpers.arrayElement([
              "individual",
              "business",
            ]),
          },
        },
      });
    }
  }

  async seed() {
    console.log("🚀 User seeding started");

    await this.connectDB();
    await this.loadRoles();

    await this.createAdmin();
    await this.createDealer();
    await this.createCustomers(10);

    console.log(" User seeding completed");
  }
}
if (require.main === module) {
  const seeder = new UserSeeder();
  seeder
    .seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = UserSeeder;
