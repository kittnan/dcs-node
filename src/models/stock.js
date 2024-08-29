const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "product_id": String,
    "product_name": String,
    "category_id": String,
    "qty": Number,
    "lot": String,
    "location_id": String,
    "expire_date": Date,
    "fifo": String,
    "qrcode": String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("stocks", model);

module.exports = UserModule;
