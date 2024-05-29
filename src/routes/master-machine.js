var mongoose = require("mongodb");
const { ObjectId } = mongoose;
let express = require("express");
let router = express.Router();
// ! USE --------------------- Set VARIABLE ------------------------------------------------------------------------

const MasterMC = require("../models/master-machine");

// ? ------------------------------------------------------ Master
// * add
// updateObjectId()
async function updateObjectId(){
  let data1 = await MasterMC.aggregate([
    {
      $match:{}
    }
  ])
  let formData = data1.map(d=>{
    d.machine_id = new ObjectId(d.machine_id)
    return {
      updateOne:{
        filter:{
          _id: d._id
        },
        update:{
          $set: d
        }
      }
    }
  })

let dd=  await MasterMC.bulkWrite(formData)
console.log("🚀 ~ dd:", dd)
}


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
