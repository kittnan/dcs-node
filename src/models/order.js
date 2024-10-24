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
    "total_amount": Number,
    "created_by": {
      "employee_id": String,
      "employee_name": String
    },
    "products": [
      {
        "product_id": String,
        "product_name": String,
        "status": String,
        "qty": Number,
        "qty_withdraw" :Number,
        "price": Number,
        "total_price": Number
      },
    ]
  },
  { timestamps: true, versionKey: false, strict: true }
);

const UserModule = mongoose.model("orders", model);

module.exports = UserModule;
