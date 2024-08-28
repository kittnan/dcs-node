let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const PRODUCT = require("../models/master-product");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await PRODUCT.insertMany(req.body);
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
    const data = await PRODUCT.bulkWrite(formUpdate)
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
    const data = await PRODUCT.bulkWrite(formUpdate)
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
      },
      {
        $lookup:
        {
          from: "master-categories",
          localField: "category_id",
          foreignField: "category_id",
          as: "category"
        }
      },
      {
        $addFields:
        {
          category_name: {
            $arrayElemAt: [
              "$category.category_name",
              0
            ]
          }
        }
      },
      {
        $unset:
          "category"
      }
    ]

    const data = await PRODUCT.aggregate(con);
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
          product_id: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await PRODUCT.aggregate(con)
    let newCode = 'P00001'
    if (data?.length != 0) {
      let codeData = data[0]
      let sp = codeData.product_id.split('P')[1]
      let number = (Number(sp) + 1).toString().padStart(5, '0')
      newCode = `P${number}`
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
