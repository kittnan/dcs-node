let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const LOCATION = require("../models/master-location");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await LOCATION.insertMany(req.body);
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
    const data = await LOCATION.bulkWrite(formUpdate)
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
    const data = await LOCATION.bulkWrite(formUpdate)
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
    const data = await LOCATION.aggregate(con);
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
    const data = await LOCATION.aggregate(con);
    res.json(data);
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
          location_id: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await LOCATION.aggregate(con)
    let newCode = 'SHF00001'
    if (data?.length != 0) {
      let codeData = data[0]
      let sp = codeData.location_id.split('SHF')[1]
      let number = (Number(sp) + 1).toString().padStart(5, '0')
      newCode = `SHF${number}`
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
