let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const CUSTOMER = require("../models/master-customer");
// let axios = require("axios");

router.post("/create", async (req, res, next) => {
  try {
    const data = await CUSTOMER.insertMany(req.body);
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
    const data = await CUSTOMER.bulkWrite(formUpdate)
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
    const data = await CUSTOMER.bulkWrite(formUpdate)
    res.json(data); // Return the result of the update operation
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


router.get("/", async (req, res, next) => {
  try {
    await deleteBase64()
    let { customer_id, sale_id } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      },
    ]
    if (customer_id) {
      customer_id = JSON.parse(customer_id)
      con.push({
        $match: {
          customer_id: {
            $in: customer_id
          }
        }
      })
    }
    if (sale_id) {
      sale_id = JSON.parse(sale_id)
      con.push({
        $match: {
          "sales._id": {
            $in: sale_id
          }
        }
      })
    }
    const data = await CUSTOMER.aggregate(con);
    res.json(data);

  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

async function deleteBase64() {
  const countDoc = await CUSTOMER.countDocuments({});
  const batchSize = 50
  const totalBatches = Math.ceil(countDoc / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    const skip = batch * batchSize;
    const customers = await CUSTOMER.find({}).skip(skip).limit(batchSize);

    for (const customer of customers) {
      let isChanged = false;
      const products = customer.products || [];

      for (const product of products) {
        if (!Array.isArray(product.imgs) || product.imgs.length === 0) continue;

        for (const img of product.imgs) {
          if (!img) continue;
          if (Object.prototype.hasOwnProperty.call(img, "view")) {
            delete img.view;
            isChanged = true;
          }
          if (Object.prototype.hasOwnProperty.call(img, "blobUrl")) {
            delete img.blobUrl;
            isChanged = true;
          }
        }
      }

      if (isChanged) {
        customer.markModified("products");
        await customer.save();
      }
    }
  }

}

router.get("/name", async (req, res, next) => {
  try {
    let { customer_id, sale_id } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      }

    ]
    if (customer_id) {
      customer_id = JSON.parse(customer_id)
      con.push({
        $match: {
          customer_id: {
            $in: customer_id
          }
        }
      })
    }
    if (sale_id) {
      sale_id = JSON.parse(sale_id)
      con.push({
        $match: {
          "sales._id": {
            $in: sale_id
          }
        }
      })
    }
    con.push({
      $project: {
        customer_id: "$customer_id",
        customer_name: "$customer_name",
        customer_address: "$customer_address",
        customer_tel: "$customer_tel",
        _id: "$_id",
      }
    })
    const data = await CUSTOMER.aggregate(con);
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
          customer_id: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await CUSTOMER.aggregate(con)
    let newCode = 'C00001'
    if (data?.length != 0) {
      let codeData = data[0]
      let sp = codeData.customer_id.split('C')[1]
      let number = (Number(sp) + 1).toString().padStart(5, '0')
      newCode = `C${number}`
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
