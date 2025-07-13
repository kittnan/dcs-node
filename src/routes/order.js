let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const ORDER = require("../models/order");
const moment = require("moment");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await ORDER.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

router.post("/update", async (req, res, next) => {
  try {

    let payloads = req.body
    let formUpdate = payloads.map(pay => {
      if (pay._id) {
        return {
          updateOne: {
            filter: {
              _id: new ObjectId(pay._id)
            },
            update: {
              $set: pay
            }
          }
        }
      } else {
        return null
      }
    }).filter(item => item)
    const data = await ORDER.bulkWrite(formUpdate)
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

router.post("/createOrUpdate", async (req, res, next) => {
  try {

    let payloads = req.body
    let formUpdate = payloads.map(pay => {
      return {
        updateOne: {
          filter: {
            _id: new ObjectId(pay._id)
          },
          update: {
            $set: pay,
          },
          upsert: true
        }
      }

    }).filter(item => item)
    const data = await ORDER.bulkWrite(formUpdate)
    res.json(data); // Return the result of the update operation
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


router.get("/", async (req, res, next) => {
  try {

    let { access, year, PIC, po_number, status, sort, order_date, po_date, delivery_date, customer_name } = req.query
    let con = [
      {
        $match: {
        }
      }
    ]
    if (status) {
      status = JSON.parse(status)
      con.push({
        $match: {
          status: {
            $in: status
          }
        }
      })
    }
    if (po_number) {
      po_number = JSON.parse(po_number)
      con.push({
        $match: {
          po_number: {
            $in: po_number
          }
        }
      })
    }
    if (customer_name) {
      customer_name = JSON.parse(customer_name)
      con.push({
        $match: {
          customer_name: {
            $in: customer_name.map(name => new RegExp(name, 'i'))
          }
        }
      })
    }
    if (access) {
      access = JSON.parse(access)
      con.push({
        $match: {
          access: {
            $in: access
          }
        }
      })
    }
    if (year) {
      con.push({
        $match: {
          year: Number(year)
        }
      })
    }

    if (order_date) {
      order_date = JSON.parse(order_date)
      con.push({
        $match: {
          order_date: {
            $gte: moment(order_date[0], 'YYYY-MM-DD').startOf('day').toDate(),
            $lte: moment(order_date[1], 'YYYY-MM-DD').endOf('day').toDate()
          }
        }
      })
    }

    if (po_date) {
      po_date = JSON.parse(po_date)
      con.push({
        $match: {
          po_date: {
            $gte: moment(po_date[0], 'YYYY-MM-DD').startOf('day').toDate(),
            $lte: moment(po_date[1], 'YYYY-MM-DD').endOf('day').toDate()
          }
        }
      })
    }

    if (delivery_date) {
      delivery_date = JSON.parse(delivery_date)
      con.push({
        $match: {
          delivery_date: {
            $gte: moment(delivery_date[0], 'YYYY-MM-DD').startOf('day').toDate(),
            $lte: moment(delivery_date[1], 'YYYY-MM-DD').endOf('day').toDate()
          }
        }
      })
    }

    if (sort) {
      sort = JSON.parse(sort)
      con.push({
        $sort: sort
      })
    }
    const dataTemp = await ORDER.aggregate(con);
    if (PIC) {
      let data = dataTemp[0].plans.map(item => {
        item.data = item.data.filter(task => {
          if (task.data.some(data => data.PIC == PIC)) return true
          return false
        })
        return item
      }).filter(item => item.data.length > 0)
      dataTemp[0].plans = data
      res.json(dataTemp);
    } else {
      res.json(dataTemp);
    }

  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/code", async (req, res, next) => {
  try {
    let con = [
      {
        $match: {

        }
      },
      {
        $sort: {
          po_number: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await ORDER.aggregate(con)
    let newCode = `${moment().format('POYYMM00001')}`
    if (data?.length != 0) {
      let codeData = data[0]
      let sp = codeData.po_number.split('')
      const poMonth = sp[2] + sp[3] + sp[4] + sp[5]
      if (poMonth != moment().format('YYMM')) {
        newCode = `${moment().format('POYYMM00001')}`
      } else {
        let number = sp[6] + sp[7] + sp[8] + sp[9] + sp[10]
        number = (parseFloat(number) + 1).toString().padStart(5, '0')
        newCode = moment().format(`POYYMM${number}`)
      }
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
