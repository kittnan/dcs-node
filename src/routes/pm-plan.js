let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const PM_PLAN = require("../models/pm-plan");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await PM_PLAN.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

router.post("/update", async (req, res, next) => {
  try {
    const data = await PM_PLAN.updateOne(req.body);
    res.json(data);
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
    const dataTemp = await PM_PLAN.aggregate(con);
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

module.exports = router;
