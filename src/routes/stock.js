let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const STOCK = require("../models/stock");
// let axios = require("axios");
const moment = require("moment");

router.post("/create", async (req, res, next) => {
  try {
    let payloads = req.body
    let items = await mapFifo(payloads)
    const data = await STOCK.insertMany(items);
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
    const data = await STOCK.bulkWrite(formUpdate)
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
    const data = await STOCK.bulkWrite(formUpdate)
    res.json(data); // Return the result of the update operation
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


router.get("/", async (req, res, next) => {
  try {
    let { } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      }
    ]
    const data = await STOCK.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/withProduct", async (req, res, next) => {
  try {
    let { } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      },
      {
        $lookup:
        {
          from: "master-products",
          localField: "category_id",
          foreignField: "category_id",
          as: "products"
        }
      }
    ]
    const data = await STOCK.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

function mapFifo(payloads) {
  return new Promise(async resolve => {
    let arr = []
    for (let i = 0; i < payloads.length; i++) {
      const element = payloads[i];
      const newFIFO = await getFifo()
      element.fifo = newFIFO
      arr.push(element)
    }
    resolve(arr)
  })
}
async function getFifo() {
  let con = [
    {
      $match: {

      }
    },
    {
      $sort: {
        fifo: -1
      }
    },
    {
      $limit: 1
    }
  ]

  let data = await STOCK.aggregate(con)
  let newCode = moment().format('YYMM00001')
  if (data?.length != 0) {
    let current = moment().format('YYMM')
    let codeData = data[0]
    let text1 = codeData.fifo.slice(0, 4)
    if (current == text1) {
      let text2 = codeData.fifo.slice(4)
      text2 = (Number(text2) + 1).toString().padStart(5, '0')
      newCode = text1 + text2
    }
  }
  return newCode
}

router.get("/code", async (req, res, next) => {
  try {
    let con = [
      {
        $match: {

        }
      },
      {
        $sort: {
          fifo: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await STOCK.aggregate(con)
    let newCode = moment().format('YYMM00001')
    if (data?.length != 0) {
      let current = moment().format('YYMM')
      let codeData = data[0]
      let text1 = codeData.fifo.slice(0, 4)
      if (current == text1) {
        let text2 = codeData.fifo.slice(4)
        text2 = (Number(text2) + 1).toString().padStart(5, '0')
        newCode = text1 + text2
      }
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


module.exports = router;
