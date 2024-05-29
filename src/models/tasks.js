const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    lastPM: Date,
  machine_id: mongoose.Schema.Types.ObjectId,
  PIC: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true, versionKey: false, strict: false }
);

const UserModule = mongoose.model("tasks", model);

module.exports = UserModule;
