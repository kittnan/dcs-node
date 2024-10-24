var mongoose = require("mongodb");
const { ObjectId } = mongoose;
let express = require("express");
let router = express.Router();
// ! USE --------------------- Set VARIABLE ------------------------------------------------------------------------

const MasterUser = require("../models/master-user");

router.get('', async (req, res) => {
  try {
    let { _id } = req.query
    let con = []
    if (_id) {
      con.push({
        $match: {
          _id: new ObjectId(_id)
        }
      })
    }
    res.json(
      await MasterUser.aggregate(
        [
          {
            $match: {}
          },
          ...con
        ]
      )
    )
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.send(500)
  }
})
router.get('/getSale', async (req, res) => {
  try {
 
    res.json(
      await MasterUser.aggregate(
        [
          {
            $match: {
              permission:"sale"
            }
          },
        ]
      )
    )
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.send(500)
  }
})
router.post('/create', async (req, res) => {
  try {
    res.json(
      await MasterUser.insertMany(req.body)
    )
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.send(500)
  }
})
router.post('/update', async (req, res) => {
  try {
    res.json(
      await MasterUser.bulkWrite(
        [
          {
            updateOne: {
              filter: {
                _id: new ObjectId(req.body._id)
              },
              update: {
                $set: req.body
              }
            }
          }
        ]
      )
    )
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.send(500)
  }
})

router.delete('', async (req, res) => {
  try {
    let { _id } = req.query
    res.json(
      await MasterUser.deleteOne(
          {
            _id: new ObjectId(_id)
          },
      )
    )
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.send(500)
  }
})


module.exports = router;
