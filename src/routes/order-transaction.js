let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const ORDER_TRANSACTION = require("../models/order-transaction");
const moment = require("moment");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await ORDER_TRANSACTION.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/", async (req, res, next) => {
  try {
    let { po_number } = req.query
    let con = [
      {
        $match: {}
      }
    ]
    if (po_number) {
      con.push({
        $match: {
          po_number: po_number
        }
      })
    }
    const data = await ORDER_TRANSACTION.aggregate(con)
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/getRunNo", async (req, res, next) => {
  try {
    let con = [
      {
        $match: {
          createdAt: {
            $gte: moment().startOf('month').toDate(),
            $lte: moment().endOf('month').toDate()
          }
        }
      },
      {
        $sort: {
          run_no: -1
        }
      },
      {
        $limit: 1
      }
    ]
    const data = await ORDER_TRANSACTION.aggregate(con)
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});



module.exports = router;
