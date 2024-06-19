var mongoose = require("mongodb");
const { ObjectId } = mongoose;
let express = require("express");
let router = express.Router();
// ! USE --------------------- Set VARIABLE ------------------------------------------------------------------------

const rout = require("../models/master-pm-list");

// ? ------------------------------------------------------ Master
// * add


router.post("/", async function (req, res, next) {
  try {
    const payload = req.body;
    let add = await rout.insertMany(payload)
    res.json(add)
  } catch (error) {
    res.send(500)
  }
});


// find all

router.get("/getByParam", async function (req, res, next) {
  try {
    let { _id, form, no } = req.query
    let con = [{
      $match: {}
    }]
    if (_id) {
      _id = JSON.parse(_id)
      _id = _id.map(id => new ObjectId(id))
      con.push({
        _id: {
          $in: _id
        }
      })
    }
    if (form) {
      form = JSON.parse(form)
      con.push({
        form: {
          $in: form
        }
      })
    }
    if (no) {
      no = JSON.parse(no)
      con.push({
        no: {
          $in: no
        }
      })
    }
    const data = await rout.aggregate(con)
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

router.get("/", async function (req, res, next) {
  try {
    const payload = req.body;
    let data = await rout.find(payload)
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
    let data = await rout.findByIdAndUpdate(
      { _id: id },
      { $set: payload })
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

// * update many
router.put("/updateMany", async function (req, res, next) {
  try {
    let formUpdate = req.body.map(item => {
      return {
        updateOne: {
          filter: { _id: new ObjectId(item._id) },
          update: { $set: item }
        }
      }
    })
    let resData = await rout.bulkWrite(formUpdate)
    res.json(resData)
  } catch (error) {
    res.send(500)
  }
});
// * deleteByForm
router.delete("/deleteByForm", async function (req, res, next) {
  try {
    let { formNum } = req.query
    let resData = await rout.deleteMany({ form: Number(formNum) })
    let formData = await rout.aggregate([{ $match: {} }])
    let formDataUpdate = formData.map(item => {
      if (item.form > formNum) {
        let diff = formNum - item.form
        let diffAb = Math.abs(diff)
        if (item.form > formNum) {
          item.form = item.form - diffAb
        }
      }
      return {
        updateMany: {
          filter: {
            _id: new ObjectId(item._id)
          },
          update: {
            $set: {
              form: item.form
            }
          }
        }
      }
    })
    await rout.bulkWrite(formDataUpdate)
    res.json(resData)
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.send(500)
  }
});

// * delete
router.delete("/:id", async function (req, res, next) {
  const { id } = req.params;
  try {
    let data = await rout.deleteOne({ _id: id })
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});







//find
router.post("/getByCondition", async function (req, res, next) {
  const payload = req.body;
  try {
    let data = await rout.find(payload)
    res.json(data)
  } catch (error) {
    res.send(500)
  }
});

router.post("/DelByCondition", async function (req, res, next) {
  const payload = req.body;
  try {
    let data = await rout.deleteMany(payload);
    res.json(data);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    return;
  }

});




module.exports = router;
