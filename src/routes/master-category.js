let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const CATEGORY = require("../models/master-category");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await CATEGORY.insertMany(req.body);
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
    const data = await CATEGORY.bulkWrite(formUpdate)
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
    const data = await CATEGORY.bulkWrite(formUpdate)
    res.json(data); // Return the result of the update operation
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


router.get("/", async (req, res, next) => {
  try {
    let { _id } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      }
    ]
    if (_id) {
      con.push({
        $match: {
          _id: new ObjectId(_id)
        }
      })
    }
    const data = await CATEGORY.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/fields", async (req, res, next) => {
  try {
    const { fields } = req.body
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: "Invalid fields parameter" });
    }
    const projectStage = {
      $project: fields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {
        _id: 1 // Always include the _id field
      })
    };
    const data = await CATEGORY.aggregate([
      {
        $match: {
          active: true
        }
      },
      projectStage
    ]);
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
    const data = await CATEGORY.aggregate(con);
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
          category_id: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await CATEGORY.aggregate(con)
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
