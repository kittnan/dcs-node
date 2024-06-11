const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    year:Number
  },
  { timestamps: true, versionKey: false, strict: false }
);

const UserModule = mongoose.model("pm-plans", model);

module.exports = UserModule;
