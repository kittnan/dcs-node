let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;

const USERS = require("../models/users");
// let axios = require("axios");

router.post("/login", async (req, res, next) => {
  try {
    res.send('ok')
    // const payload = req.body;
    // console.log("🚀 ~ payload:", payload)
    // const adAcc = await axios.post("http://10.200.90.152:4038/AzureLogin/getByCondition", {
    //   username: payload.username,
    //   password: payload.password,
    // });
    // console.log("🚀 ~ adAcc:", adAcc.data);
    // if (adAcc?.data == "User not found") {
    //   const resDB = await USERS.aggregate([
    //     {
    //       $match: {
    //         employeeCode: payload.username,
    //         employeeCode: payload.password,
    //       },
    //     },
    //   ]);
    //     res.json(resDB);
    // } else {
    //   const resDB = await USERS.aggregate([
    //     {
    //       $match: {
    //         employee_code: adAcc.data.description,
    //       },
    //     },
    //   ]);
    //   res.json(resDB);
    // }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
})

router.post("/import", async (req, res, next) => {
  try {
    const deleteStat = await USERS.deleteMany({});
    console.log("🚀 ~ deleteStat:", deleteStat);
    const data = await USERS.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/create", async (req, res, next) => {
  try {
    const data = await USERS.insertMany(req.body);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});



router.get("/", async (req, res, next) => {
  try {
    let { access, active = true } = req.query
    let con = [
      {
        $match: {
          active: active
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
    const usersQuery = await USERS.aggregate(con);
    res.json(usersQuery);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
