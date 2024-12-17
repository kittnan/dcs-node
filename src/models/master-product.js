const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "product_id": String,
    "product_name": String,
    "product_unit": String,
    "description": String,
    "category_id": String,
    "base_price": Number,
    "minimum": Number,
    "imgs": {
      type: [],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    action: []
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("master-products", model);

module.exports = UserModule;
