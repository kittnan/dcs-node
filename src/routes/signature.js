let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const REPORT = require("../models/report");
const REPORT_PM = require("../models/report-pm");
const SPECIAL = require("../models/report-special");
const SPECIAL_PM = require("../models/report-pm-special");
const moment = require("moment");



router.get('/getExp', async (req, res) => {
  try {
    let { _id, m } = req.query
    let data
    if (m == 1) {
      data = await REPORT.findOne({ _id: new ObjectId(_id) })
    }
    if (m == 2) {
      data = await REPORT_PM.findOne({ _id: new ObjectId(_id) })
    }
    if (m == 3) {
      data = await SPECIAL.findOne({ _id: new ObjectId(_id) })
    }
    if (m == 4) {
      data = await SPECIAL_PM.findOne({ _id: new ObjectId(_id) })
    }
    if (!data) {
      return res.json({ status: false, message: "ไม่พบข้อมูล" })
    }

    if(data.sign){
      return res.json({ status: false, message: "ลายเซ็นต์ถูกเซ็นไปแล้ว" })
    }
    
    if(!data.sigExp){
      return res.json({ status: false, message: "ลิ้งหมดอายุ" })
    }
    const exp = moment(data.sigExp)
    const now = moment()
    if (exp.isBefore(now)) {
      return res.json({ status: false, message: "ลิ้งหมดอายุ" })
    }
    res.json({ status: true, data })
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})

router.post('/updateSign', async (req, res) => {
  try {
    let { _id, m, sigExp, sign } = req.body
    let data
    if (m == 1) {
      data = await REPORT.findOneAndUpdate({ _id: new ObjectId(_id) }, { sign: sign })
    }
    if (m == 2) {
      data = await REPORT_PM.findOneAndUpdate({ _id: new ObjectId(_id) }, { sign: sign })
    }
    if (m == 3) {
      data = await SPECIAL.findOneAndUpdate({ _id: new ObjectId(_id) }, { sign: sign })
    }
    if (m == 4) {
      data = await SPECIAL_PM.findOneAndUpdate({ _id: new ObjectId(_id) }, { sign: sign })
    }
    if (!data) {
      return res.json({ status: false, message: "Data not found" })
    }
    res.json({ status: true, data })
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})

router.post('/updateExp', async (req, res) => {
  try {
    let { _id, m, sigExp } = req.body
    let data
    if (m == 1) {
      data = await REPORT.findOneAndUpdate({ _id: new ObjectId(_id) }, { sigExp })
    }
    if (m == 2) {
      data = await REPORT_PM.findOneAndUpdate({ _id: new ObjectId(_id) }, { sigExp })
    }
    if (m == 3) {
      data = await SPECIAL.findOneAndUpdate({ _id: new ObjectId(_id) }, { sigExp })
    }
    if (m == 4) {
      data = await SPECIAL_PM.findOneAndUpdate({ _id: new ObjectId(_id) }, { sigExp })
    }
    if (!data) {
      return res.json({ status: false, message: "Data not found" })
    }
    res.json({ status: true, data })
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})


module.exports = router;
