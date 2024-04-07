const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
   finishDate:Date,
   startDate:Date,
  },
  { timestamps: true, versionKey: false, strict: false }
);

const UserModule = mongoose.model("report_pm", model);

module.exports = UserModule;
