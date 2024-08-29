const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "customer_id": String,
    "customer_name": String,
    "products": [],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("master-customers", model);

module.exports = UserModule;
