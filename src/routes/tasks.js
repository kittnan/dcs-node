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
router.post('/create', async (req, res) => {
  try {
    let data = {
      "province": req.body.Province,
      "district": req.body.District,
      "customer": req.body.District,
      "machine": req.body.Machine,
      "model": req.body.Model,
      "S/N": req.body['S/N'],
      "target": null,
      "PIC": req.body.PIC && req.body.PIC.length > 0 ? new ObjectId(req.body.PIC[0]) : null,
      "machine_id": new ObjectId(req.body._id),
      "lastPM": new Date(),
      "group": null,
      "no": null,
      "active": false
    }
    const result = await TASKS.insertMany(data)
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})
router.put('/updateData', async (req, res) => {
  try {
    const result = await TASKS.updateOne({ _id: new ObjectId(req.body._id) }, { $set: req.body })
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})
router.put('/updateDataGroup', async (req, res) => {
  try {
    let lastByGroup = await TASKS.aggregate([
      {
        $match: {
          group: req.body.group
        }
      }
    ]).sort({ no: 1 }).limit(1)
    if (lastByGroup && lastByGroup.length > 0) {
      const result = await TASKS.updateOne({ _id: new ObjectId(req.body._id) }, {
        $set: {
          ...req.body,
          no: lastByGroup[0].no + 1
        }
      })
      res.json(result)
    } else {
      const result = await TASKS.updateOne({ _id: new ObjectId(req.body._id) }, {
        $set: {
          ...req.body,
          no: 1
        }
      })
      res.json(result)
    }

  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})
router.put('/updateDataMany', async (req, res) => {
  try {
    let formUpdate = req.body.map(item => {
      return {
        updateOne: {
          filter: {
            _id: new ObjectId(item._id)
          },
          update: {
            $set: item
          }
        }
      }
    })
    const result = await TASKS.bulkWrite(formUpdate)
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})
router.put('/update', async (req, res) => {
  try {
    const result = await TASKS.updateOne({ machine_id: new ObjectId(req.body.machine_id) }, { $set: { active: false } })
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})
router.put('/updateLastPM', async (req, res) => {
  try {
    const result = await TASKS.updateOne({ machine_id: new ObjectId(req.body.machine_id) }, { $set: { lastPM: moment().toDate() } })
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})

router.get('/genPM', async (req, res) => {
  try {
    let plans = await genPMPlan()
    res.json(plans)
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.sendStatus(500)
  }
})
// genPMPlan()
async function genPMPlan() {
  try {
    let con2 = [
      {
        $match: {
          active: true,
          // province:"กำแพงเพชร"
        }
      },

      {
        '$lookup': {
          'from': 'master_machines',
          'localField': 'machine_id',
          'foreignField': '_id',
          'as': 'machine'
        }
      },
      {
        '$addFields': {
          'machine': {
            '$arrayElemAt': [
              '$machine', 0
            ]
          }
        }
      },
      {
        '$addFields': {
          'PIC': {
            '$arrayElemAt': [
              '$machine.PIC', 0
            ]
          }
        }
      }, {
        '$addFields': {
          'PIC': {
            '$toObjectId': '$PIC'
          }
        }
      },
      {
        '$lookup': {
          'from': 'master_users',
          'localField': 'PIC',
          'foreignField': '_id',
          'as': 'PIC'
        }
      },
      {
        '$addFields': {
          'PIC': {
            '$arrayElemAt': [
              '$PIC', 0
            ]
          },
        }
      },

    ]
    let tasks = await TASKS.aggregate(con2)
    let year = 2024
    let month = 12
    let arr = []

    let tasksEst = tasks.map(item => {
      if (item.lastPM) {
        item.pmEst = moment(item.lastPM).format('MM-YY')
      } else {
        item.pmEst = null
      }
      return item
    })
    let pmPlan = tasksEst.reduce((p, item) => {
      let pm = null
      for (let i = 1; i <= 12; i++) {
        let now = moment(`01-${i}-${year}`, 'DD-M-YYYY').format('MM-YY')
        if (!pm) {
          if (item.pmEst) {
            pm = moment(item.pmEst, 'MM-YY').format('MM-YY')
          } else {
            pm = moment().format('MM-YY')
          }
        }
        if (pm) {
          let nextPlan = moment(pm, 'MM-YY').add(item.target, 'month').format('MM-YY')
          if (nextPlan == now) {
            item.plan = moment(now, 'MM-YY').toDate()
            item.pmEst = now
            p.push({ ...item })
            pm = now
          }
        }
      }
      return p
    }, [])
    let sum = pmPlan.reduce((p, n) => {
      let indexP = p.findIndex(pp => {
        let pProvince = pp.province ? pp.province : null
        let nProvince = n.machine?.Province ? n.machine.Province : null
        let pCustomer = pp.customer ? pp.customer : null
        let nCustomer = n.machine?.Customer ? n.machine.Customer : null
        let pMachine = pp.machine ? pp.machine : null
        let nMachine = n.machine?.Machine ? n.machine.Machine : null
        let pModel = pp.model ? pp.model : null
        let nModel = n.machine?.Model ? n.machine.Model : null
        if (pProvince && nProvince && pCustomer && nCustomer && pMachine && nMachine && pModel && nModel) {
          return pp.province == n.machine.Province && pp.customer == n.machine.Customer && pp.machine == n.machine.Machine && pp.model == n.machine.Model
        }
        // pp.province == n.machine.Province && pp.customer == n.machine.Customer && pp.machine == n.machine.Machine && pp.model == n.machine.Model
      })
      if (indexP != -1) {
        n.PIC = n.PIC?.name
        p[indexP].data.push(n)
      } else {
        n.PIC = n.PIC?.name
        let obj = {
          province: n?.machine?.Province,
          customer: n?.machine?.Customer,
          machine: n?.machine?.Machine,
          machine_id: n.machine_id,
          model: n?.machine?.Model,
          group: n?.group,
          sn: n?.machine ? n.machine['S/N'] : null,
          no: n?.no,
          data: [n]
        }
        p.push(obj)
      }
      return p
    }, [])
    sum.map(s=>{
      if(!s.province){
        console.log(s);
      }
    })
    sum = sum.filter(s=>s.province)
    let sumSort = sum.sort((a, b) => {
      const nameA = a?.province?.toLowerCase();
      const nameB = b?.province?.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    })

    let group = [...new Set(sumSort.map(item => item.group))]

    let newGroup = group.map(g => {
      let items = sumSort.filter(a => a.group == g).sort((a, b) => {
        if (a.province < b.province) {
          return -1;
        } else if (a.province > b.province) {
          return 1;
        } else {
          if (a.customer < b.customer) {
            return -1;
          } else if (a.customer > b.customer) {
            return 1;
          } else {
            return 0;
          }
        }
      });
      let items2 = items.map(item => {

      })
      return {
        group: g,
        data: items
      }
    }).sort((a, b) => a.group - b.group)
    // console.log("🚀 ~ newGroup:", newGroup)
    return newGroup
  } catch (error) {
    console.log("🚀 ~ error:", error)

  }
}

module.exports = router;
