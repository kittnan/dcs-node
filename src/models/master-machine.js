const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const List = new Schema(
    {
      date: Date,
      Date: Date,
      // ToDate : Date,
      // model: String,
      // value: [],
    },
    // { timestamps: true, versionKey: false, strict: false }
    { timestamps: true, versionKey: false, strict: false }
  );

const ListModule = mongoose.model("master_machine", List);

module.exports = ListModule;
