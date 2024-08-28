let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const ORDER = require("../models/order");
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
    let { access, year, PIC } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      }
    ]
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
          category_id: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await ORDER.aggregate(con)
    let newCode = 'CAT00001'
    if (data?.length != 0) {
      let codeData = data[0]
      let sp = codeData.category_id.split('CAT')[1]
      let number = (Number(sp) + 1).toString().padStart(5, '0')
      newCode = `CAT${number}`
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
