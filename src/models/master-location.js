const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "location_id": String,
    "location_name": String,
    "description": String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("master-location", model);

module.exports = UserModule;
