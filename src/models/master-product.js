const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "product_id": String,
    "product_name": String,
    "description": String,
    "category_id": String,
    "base_price": Number,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("products", model);

module.exports = UserModule;
