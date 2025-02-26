const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
  {
    "order_id": String,
    "customer_id": String,
    "customer_name": String,
    "order_date": Date,
    "po_number": String,
    "status": String,
    "po_date": Date,
    "delivery_date": Date,
    "delivery_by": String,
    "total_amount": Number,
    "created_by": {
      "employee_id": String,
      "employee_name": String
    },
    "finish_by": {
      "employee_id": String,
      "employee_name": String
    },
    "finish_date": Date,
    "finish_date_local": String,
    "products": [
      // {
      //   "product_id": String,
      //   "product_name": String,
      //   "status": String,
      //   "qty": Number,
      //   "qty_withdraw" :Number,
      //   "price": Number,
      //   "total_price": Number
      // },
    ],
    "historyScan": []
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("orders", model);

module.exports = UserModule;
