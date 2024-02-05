const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    employeeCode: String,
    firstName: String,
    lastName: String,
    email: String,
    access: [],
    corporate: String,
    department: String,
    sectionName: String,
    sectionCode: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("users", model);

module.exports = UserModule;
