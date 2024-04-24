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


// let axios = require("axios");
let path = ''

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
    const result = await REPORT.aggregate(con)
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})
router.get('/multi', async (req, res) => {
  try {
    let { active = 'true', no, _id, status, customer, machine, report, service, type, user } = req.query
    let con = [
      {
        $match: {
          status: 'finish'
        }
      }
    ]
    report = JSON.parse(report)
    type = JSON.parse(type)

    customer = JSON.parse(customer)
    if (customer) {
      con.push({
        $match: {
          'customer.Customer': customer
        }
      })
    }
    machine = JSON.parse(machine)
    if (machine) {
      con.push({
        $match: {
          'machine.Machine': machine
        }
      })
    }
    service = JSON.parse(service)
    if (service) {
      con.push({
        $match: {
          'serviceType.value': service
        }
      })
    }
    user = JSON.parse(user)
    if (user) {
      con.push({
        $match: {
          'userActive._id': user._id
        }
      })
    }

    if (type && report) {
      if (type == 'engineer' && report == 'report') {
        let result = await REPORT.aggregate(con)
        result = result.map(item => {
          item.type = 'engineer'
          item.report = 'report'
          return item
        })
        res.json(result)

      }
      if (type == 'engineer' && report == 'pm') {
        let result = await REPORT_PM.aggregate(con)
        result = result.map(item => {
          item.type = 'engineer'
          item.report = 'pm'
          return item
        })
        res.json(result)

      }
      if (type == 'special' && report == 'report') {
        let result = await SPECIAL.aggregate(con)
        result = result.map(item => {
          item.type = 'special'
          item.report = 'report'
          return item
        })
        res.json(result)

      }
      if (type == 'special' && report == 'pm') {
        let result = await SPECIAL_PM.aggregate(con)
        result = result.map(item => {
          item.type = 'special'
          item.report = 'pm'
          return item
        })
        res.json(result)

      }
    } else if (type) {
      if (type == 'engineer') {
        let result = (await REPORT.aggregate(con))
        result = result.map(item => {
          item.type = 'engineer'
          item.report = 'report'
          return item
        })
        let resultPM = await REPORT_PM.aggregate(con)
        result = result.map(item => {
          item.type = 'engineer'
          item.report = 'pm'
          return item
        })
        let merge = [...result, ...resultPM]
        res.json(merge)
      }
      if (type == 'special') {
        let result = await SPECIAL.aggregate(con)
        result = result.map(item => {
          item.type = 'special'
          item.report = 'report'
          return item
        })
        let resultPM = await SPECIAL_PM.aggregate(con)
        result = result.map(item => {
          item.type = 'special'
          item.report = 'pm'
          return item
        })
        let merge = [...result, ...resultPM]
        res.json(merge)
      }
    } else if (report) {
      if (report == 'report') {
        let engineer = await REPORT.aggregate(con)
        engineer = engineer.map(item => {
          item.type = 'engineer'
          item.report = 'report'
          return item
        })
        let special = await SPECIAL.aggregate(con)
        special = special.map(item => {
          item.type = 'special'
          item.report = 'report'
          return item
        })
        let merge = [...engineer, ...special]
        res.json(merge)
      }
      if (report == 'pm') {
        let engineer = await REPORT_PM.aggregate(con)
        engineer = engineer.map(item => {
          item.type = 'engineer'
          item.report = 'pm'
          return item
        })
        let special = await SPECIAL_PM.aggregate(con)
        special = special.map(item => {
          item.type = 'special'
          item.report = 'pm'
          return item
        })
        let merge = [...engineer, ...special]
        res.json(merge)
      }
    } else {
      let engineer = await REPORT.aggregate(con)
      engineer = engineer.map(item => {
        item.type = 'engineer'
        item.report = 'report'
        return item
      })
      let engineer2 = await REPORT_PM.aggregate(con)
      engineer2 = engineer2.map(item => {
        item.type = 'engineer'
        item.report = 'pm'
        return item
      })
      let special = await SPECIAL.aggregate(con)
      special = special.map(item => {
        item.type = 'special'
        item.report = 'report'
        return item
      })
      let special2 = await SPECIAL_PM.aggregate(con)
      special2 = special2.map(item => {
        item.type = 'special'
        item.report = 'pm'
        return item
      })
      let merge = [...engineer, ...engineer2, ...special, ...special2]
      res.json(merge)
    }

    // if (active) {
    //   active = active == 'true' ? true : false
    //   con.push({
    //     $match: {
    //       active: active
    //     }
    //   })
    // }
    // if (status) {
    //   con.push({
    //     $match: {
    //       status: status
    //     }
    //   })
    // }
    // if (_id) {
    //   _id = JSON.parse(_id)
    //   con.push({
    //     $match: {
    //       _id: {
    //         $in: _id.map(id => new ObjectId(id))
    //       }
    //     }
    //   })
    // }

  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.sendStatus(500)
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



// router.post('/upload', (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send('No files were uploaded.');
//   }

//   let uploadedFile = req.files.file;
//   let savePath = 'C:/xampp/htdocs/img/' + uploadedFile.name
//   uploadedFile.mv(savePath, (err) => {
//     if (err) {
//       return res.status(500).send(err);
//     }
//     res.json({ savePath: savePath, readPath: `http://127.0.0.1/img/${uploadedFile.name}` })
//   });
// });

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


//find
router.post("/getByCondition", async function (req, res, next) {
  const payload = req.body;
  try {
    let data = await REPORT.find(payload)
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

module.exports = router;
