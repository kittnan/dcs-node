const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "fifo": String,
    "lot": String,
    "name": String,
    "category_id": String,
    "base_price": Number,
    "imgs": {
      type: [],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("stocks", model);

module.exports = UserModule;
