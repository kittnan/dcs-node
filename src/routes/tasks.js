let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const REPORT = require("../models/report");
const REPORT_PM = require("../models/report-pm");
const SPECIAL = require("../models/report-special");
const SPECIAL_PM = require("../models/report-pm-special");
const TASKS = require("../models/tasks");
const moment = require("moment");


router.get('', async (req, res) => {
  try {
    let { active = 'true', no, _id, status } = req.query
    let con = [
      {
        $match: {}
      }
    ]
    if (active) {
      active = active == 'true' ? true : false
      con.push({
        $match: {
          active: active
        }
      })
    }
    if (_id) {
      con.push({
        $match: {
          _id: new ObjectId(_id)
        }
      })
    }
    if (status) {
      con.push({
        $match: {
          status: status
        }
      })
    }

    let con2 = [
      {
        '$lookup': {
          'from': 'master_users',
          'localField': 'PIC',
          'foreignField': '_id',
          'as': 'PIC'
        }
      }, {
        '$lookup': {
          'from': 'master_machines',
          'localField': 'machine_id',
          'foreignField': '_id',
          'as': 'machine'
        }
      }, {
        '$addFields': {
          'PIC': {
            '$arrayElemAt': [
              '$PIC', 0
            ]
          },
          'machine': {
            '$arrayElemAt': [
              '$machine', 0
            ]
          }
        }
      }
    ]
    const result = await TASKS.aggregate([...con2])
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})

module.exports = router;
