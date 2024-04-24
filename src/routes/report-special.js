let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const REPORT = require("../models/report-special");
const moment = require("moment");

// let axios = require("axios");
let path = ''

router.get('', async (req, res) => {
  try {
    let { active = 'true', no, _id,status } = req.query
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
    const result = await REPORT.aggregate(con)
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})

router.post('/createNewReport', async (req, res) => {
  try {
    let payload = req.body
    if (!payload.userActive) throw 'please login!'
    let lastRecord = await REPORT.aggregate([{
      $match: {
        createdAt: {
          $gte: moment().startOf('year').toDate(),
          $lte: moment().endOf('year').toDate()
        }
      }
    }]).sort({ createdAt: -1 }).limit(1)
    if (lastRecord && lastRecord.length > 0) {
      lastRecord = lastRecord[0]
      let lastFourDigits = lastRecord.no.substr(-3);
      lastFourDigits = Number(lastFourDigits) + 1
      lastFourDigits = lastFourDigits.toString().padStart(3, '0')
      const newRunNo = moment().format('YYYYMM') + lastFourDigits
      const result = await REPORT.insertMany({ no: newRunNo, status: 'draft', data: null, active: true, userActive: payload.userActive })
      res.json(result)
    } else {
      const newRunNo = moment().format('YYYYMM001')
      const result = await REPORT.insertMany({ no: newRunNo, status: 'draft', data: null, active: true, userActive: payload.userActive })
      res.json(result)
    }
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.sendStatus(500)
  }
});
router.post('/save', async (req, res) => {
  try {
    let payload = req.body
    if (!payload) throw 'No data'
    const result = await REPORT.bulkWrite([
      {
        updateMany: {
          filter: { _id: new ObjectId(payload._id) },
          update: { $set: payload }
        }
      }
    ])
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.sendStatus(500)
  }
});
router.post('/saveMultiple', async (req, res) => {
  try {
    let payload = req.body
    if (!payload) throw 'No data'
    const result = await REPORT.bulkWrite(payload.map(item => {
      return {
        updateMany: {
          filter: { _id: new ObjectId(item._id) },
          update: { $set: { status: item.status } }
        }
      }
    }))
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.sendStatus(500)
  }
});
router.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let uploadedFile = req.files.file;
  let savePath = 'C:/xampp/htdocs/img/' + uploadedFile.name
  uploadedFile.mv(savePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ savePath: savePath,readPath: `http://127.0.0.1/img/${uploadedFile.name}` })
  });
});


router.put("/insert/:id", async function (req, res, next) {
  const { id } = req.params;
  const payload = req.body;
  try {
    const payload = req.body;
    let data = await REPORT.findByIdAndUpdate(
      { _id: id },
      { $set: payload })
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

router.post("/getByCondition",async function (req, res, next) {
  const payload = req.body;
  try {
    let data = await REPORT.find(payload)
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});


module.exports = router;
