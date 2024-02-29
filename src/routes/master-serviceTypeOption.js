var mongoose = require("mongodb");
const { ObjectId } = mongoose;
let express = require("express");
let router = express.Router();
// ! USE --------------------- Set VARIABLE ------------------------------------------------------------------------

const MasterMC = require("../models/master-serviceTypeOption");

// ? ------------------------------------------------------ Master
// * add


router.post("/", async function (req, res, next) {
  try {
    const payload = req.body;
    let add = await MasterMC.insertMany(payload)
    res.json(add)
  } catch (error) {
    res.send(500)
  }
});


// find all

router.get("/", async function (req, res, next) {
  try {
    const payload = req.body;
    let data = await MasterMC.find(payload)
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

// * update
router.put("/insert/:id", async function (req, res, next) {
  const { id } = req.params;
  const payload = req.body;
  try {
    const payload = req.body;
    let data = await MasterMC.findByIdAndUpdate(
      { _id: id },
      { $set: payload })
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

// * delete
router.delete("/:id", async function (req, res, next) {
  const { id } = req.params;
  try {
    let data = await MasterMC.deleteOne({ _id: id })
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});




 


//find
router.post("/getByCondition",async function (req, res, next) {
  const payload = req.body;
  try {
    let data = await MasterMC.find(payload)
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

router.post("/DelByCondition",async function (req, res, next) {
  const payload = req.body;
  try {
    let data = await MasterMC.deleteMany(payload);
    res.json(data);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    return;
  }

});




module.exports = router;
