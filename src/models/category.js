const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "category_id": String,
    "category_name": String,
    "description": String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("master-category", model);

module.exports = UserModule;
