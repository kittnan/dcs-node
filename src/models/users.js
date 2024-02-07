const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    username: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("users", model);

module.exports = UserModule;
