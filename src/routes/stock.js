let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
require("dotenv").config()
const STOCK = require("../models/stock");
// let axios = require("axios");
const moment = require("moment");

const CUSTOMER = require("../models/master-customer");
const ORDER = require("../models/order");
const PRODUCT = require("../models/master-product");
const ORDER_TRANSACTION = require("../models/order-transaction");

// orderTranDel()
async function orderTranDel() {
  try {
    const batchSize = 100;
    const totalCount = await ORDER_TRANSACTION.countDocuments();
    const totalBatches = Math.ceil(totalCount / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const orders = await ORDER_TRANSACTION.aggregate([
        {
          $match: {}
        },
        {
          $sort: {
            _id: 1
          }
        },
        {
          $project: {
            _id: 1,
            products: 1
          }
        },
        {
          $skip: batch * batchSize
        },
        {
          $limit: batchSize
        }
      ]);

      const operations = [];

      orders.forEach((order) => {
        const products = Array.isArray(order.products) ? order.products : [];
        let changed = false;

        const nextProducts = products.map((product) => {
          const imgs = Array.isArray(product.imgs) ? product.imgs : [];

          const nextImgs = imgs.map((img) => {
            if (!img || typeof img !== "object") {
              return img;
            }

            const nextImg = { ...img };
            let imgChanged = false;

            if (Object.prototype.hasOwnProperty.call(nextImg, "view")) {
              delete nextImg.view;
              imgChanged = true;
            }

            if (Object.prototype.hasOwnProperty.call(nextImg, "blobUrl")) {
              delete nextImg.blobUrl;
              imgChanged = true;
            }

            if (imgChanged) {
              changed = true;
            }

            return nextImg;
          });

          return {
            ...product,
            imgs: nextImgs,
          };
        });

        if (changed) {
          operations.push({
            updateOne: {
              filter: { _id: order._id },
              update: {
                $set: {
                  products: nextProducts,
                },
              },
            },
          });
        }
      });

      if (operations.length > 0) {
        await ORDER_TRANSACTION.bulkWrite(operations);
        console.log(`Batch ${batch + 1}/${totalBatches} processed successfully.`);
      }

    }

    return true;

  } catch (error) {
    console.error("Error deleting orders:", error);
    throw error;
  }
}
// orderDel()
async function orderDel() {
  try {
    const batchSize = 100;
    const totalCount = await ORDER.countDocuments();
    const totalBatches = Math.ceil(totalCount / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const orders = await ORDER.aggregate([
        {
          $match: {}
        },
        {
          $sort: {
            _id: 1
          }
        },
        {
          $project: {
            _id: 1,
            products: 1
          }
        },
        {
          $skip: batch * batchSize
        },
        {
          $limit: batchSize
        }
      ]);

      const operations = [];

      orders.forEach((order) => {
        const products = Array.isArray(order.products) ? order.products : [];
        let changed = false;

        const nextProducts = products.map((product) => {
          const imgs = Array.isArray(product.imgs) ? product.imgs : [];

          const nextImgs = imgs.map((img) => {
            if (!img || typeof img !== "object") {
              return img;
            }

            const nextImg = { ...img };
            let imgChanged = false;

            if (Object.prototype.hasOwnProperty.call(nextImg, "view")) {
              delete nextImg.view;
              imgChanged = true;
            }

            if (Object.prototype.hasOwnProperty.call(nextImg, "blobUrl")) {
              delete nextImg.blobUrl;
              imgChanged = true;
            }

            if (imgChanged) {
              changed = true;
            }

            return nextImg;
          });

          return {
            ...product,
            imgs: nextImgs,
          };
        });

        if (changed) {
          operations.push({
            updateOne: {
              filter: { _id: order._id },
              update: {
                $set: {
                  products: nextProducts,
                },
              },
            },
          });
        }
      });

      if (operations.length > 0) {
        await ORDER.bulkWrite(operations);
        console.log(`Batch ${batch + 1}/${totalBatches} processed successfully.`);
      }

    }

    return true;

  } catch (error) {
    console.error("Error deleting orders:", error);
    throw error;
  }
}

// async function productDel() {
//   try {
//     const batchSize = 100;
//     const totalCount = await PRODUCT.countDocuments();
//     const totalBatches = Math.ceil(totalCount / batchSize);

//     for (let batch = 0; batch < totalBatches; batch++) {
//       const products = await PRODUCT.find().lean()
//         .skip(batch * batchSize)
//         .limit(batchSize);

//       const operations = [];

//       // products.forEach((product) => {
//       //   const imgs = Array.isArray(product.imgs) ? product.imgs : [];
//       //   let changed = false;

//       //   const nextImgs = imgs.map((img) => {

//       //     const nextImgs = imgs.map((img) => {
//       //       if (!img || typeof img !== "object") {
//       //         return img;
//       //       }

//       //       const nextImg = { ...img };
//       //       let imgChanged = false;

//       //       if (Object.prototype.hasOwnProperty.call(nextImg, "view")) {
//       //         delete nextImg.view;
//       //         imgChanged = true;
//       //       }

//       //       if (Object.prototype.hasOwnProperty.call(nextImg, "blobUrl")) {
//       //         delete nextImg.blobUrl;
//       //         imgChanged = true;
//       //       }

//       //       if (imgChanged) {
//       //         changed = true;
//       //       }

//       //       return nextImg;
//       //     });

//       //     return {
//       //       ...product,
//       //       imgs: nextImgs,
//       //     };
//       //   });

//       //   if (changed) {
//       //     operations.push({
//       //       updateOne: {
//       //         filter: { _id: product._id },
//       //         update: {
//       //           $set: {
//       //             imgs: nextImgs,
//       //           },
//       //         },
//       //       },
//       //     });
//       //   }
//       // });

//       products.forEach((product) => {
//         let imgs = Array.isArray(product.imgs) ? product.imgs : [];
//         imgs = imgs.map((img) => {

//           if (img.imgs) {
//            img = { ...img.imgs };
//           }

//           return img;

//         })
//         operations.push({
//           updateOne: {
//             filter: { _id: product._id },
//             update: {
//               $set: {
//                 imgs: imgs,
//               },
//             },
//           },
//         });
//       })

//       if (operations.length > 0) {
//         await PRODUCT.bulkWrite(operations);
//         console.log(`Batch ${batch + 1}/${totalBatches} processed successfully.`);
//       }

//     }

//     return true;

//   } catch (error) {
//     console.error("Error deleting products:", error);
//     throw error;
//   }
// }
// async function customerDel() {
//   try {
//     const batchSize = 100;
//     const totalCount = await CUSTOMER.countDocuments();
//     const totalBatches = Math.ceil(totalCount / batchSize);

//     for (let batch = 0; batch < totalBatches; batch++) {
//       const customers = await CUSTOMER.find()
//         .skip(batch * batchSize)
//         .limit(batchSize);

//       const operations = [];

//       customers.forEach((customer) => {
//         const products = Array.isArray(customer.products) ? customer.products : [];
//         let changed = false;

//         const nextProducts = products.map((product) => {
//           const imgs = Array.isArray(product.imgs) ? product.imgs : [];

//           const nextImgs = imgs.map((img) => {
//             if (!img || typeof img !== "object") {
//               return img;
//             }

//             const nextImg = { ...img };
//             let imgChanged = false;

//             if (Object.prototype.hasOwnProperty.call(nextImg, "view")) {
//               delete nextImg.view;
//               imgChanged = true;
//             }

//             if (Object.prototype.hasOwnProperty.call(nextImg, "blobUrl")) {
//               delete nextImg.blobUrl;
//               imgChanged = true;
//             }

//             if (imgChanged) {
//               changed = true;
//             }

//             return nextImg;
//           });

//           return {
//             ...product,
//             imgs: nextImgs,
//           };
//         });

//         if (changed) {
//           operations.push({
//             updateOne: {
//               filter: { _id: customer._id },
//               update: {
//                 $set: {
//                   products: nextProducts,
//                 },
//               },
//             },
//           });
//         }
//       });

//       if (operations.length > 0) {
//         await CUSTOMER.bulkWrite(operations);
//       }

//     }

//     return true;

//   } catch (error) {
//     console.error("Error deleting customers:", error);
//     throw error;
//   }
// }

router.post("/create", async (req, res, next) => {
  try {

    let payloads = req.body
    console.log(payloads);
    payloads = payloads.filter(item => !item._id)
    let data = await mapFifo(payloads)
    data = data.reduce((p, n) => p.concat(n), [])
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
    const data = await STOCK.bulkWrite(formUpdate)
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
    const data = await STOCK.bulkWrite(formUpdate)
    res.json(data); // Return the result of the update operation
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.post("/getFIFO-withdraw", async (req, res, next) => {
  try {
    let data = await STOCK.aggregate([
      {
        $match: {
          fifo: req.body.data
        }
      }
    ])
    res.json(data)
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
})

router.get("/", async (req, res, next) => {
  try {
    let { fifo, lot, category_id, product_id } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      }
    ]
    if (fifo) {
      fifo = JSON.parse(fifo)
      con.push({
        $match: {
          fifo: {
            $in: fifo
          }
        }
      })
    }
    if (lot) {
      lot = JSON.parse(lot)
      con.push({
        $match: {
          lot: {
            $in: lot
          }
        }
      })
    }
    if (category_id) {
      category_id = JSON.parse(category_id)
      con.push({
        $match: {
          category_id: {
            $in: category_id
          }
        }
      })
    }
    if (product_id) {
      product_id = JSON.parse(product_id)
      con.push({
        $match: {
          product_id: {
            $in: product_id
          }
        }
      })
    }

    const data = await STOCK.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/exportExcel", async (req, res, next) => {
  try {
    let { fifo, lot, category_id, product_id } = req.query
    let con = [
      {
        $match: {

        }
      }
    ]
    if (fifo) {
      fifo = JSON.parse(fifo)
      con.push({
        $match: {
          fifo: {
            $in: fifo
          }
        }
      })
    }
    if (lot) {
      lot = JSON.parse(lot)
      con.push({
        $match: {
          lot: {
            $in: lot
          }
        }
      })
    }
    if (category_id) {
      category_id = JSON.parse(category_id)
      con.push({
        $match: {
          category_id: {
            $in: category_id
          }
        }
      })
    }
    if (product_id) {
      product_id = JSON.parse(product_id)
      con.push({
        $match: {
          product_id: {
            $in: product_id
          }
        }
      })
    }

    const data = await STOCK.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});
router.get("/getQty", async (req, res, next) => {
  try {
    let { fifo, lot, category_id, product_id } = req.query
    let con = [
      {
        $match: {
          active: true
        }
      }
    ]
    if (fifo) {
      fifo = JSON.parse(fifo)
      con.push({
        $match: {
          fifo: {
            $in: fifo
          }
        }
      })
    }
    if (lot) {
      lot = JSON.parse(lot)
      con.push({
        $match: {
          lot: {
            $in: lot
          }
        }
      })
    }
    if (category_id) {
      category_id = JSON.parse(category_id)
      con.push({
        $match: {
          category_id: {
            $in: category_id
          }
        }
      })
    }
    if (product_id) {
      product_id = JSON.parse(product_id)
      con.push({
        $match: {
          product_id: {
            $in: product_id
          }
        }
      })
    }

    // const data = await STOCK.aggregate([...con, { $count: 'count' }]);
    const data = await STOCK.aggregate([...con, {
      $group: {
        _id: null,
        count: { $sum: "$balance" }
      }
    }
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
    const data = await STOCK.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

function mapFifo(payloads) {
  return new Promise(async resolve => {
    let arr = []
    for (let i = 0; i < payloads.length; i++) {
      const element = payloads[i];
      const newFIFO = await getFifo()
      element.fifo = newFIFO
      let data = await STOCK.insertMany(element)
      console.log(data);

      arr.push(data)
      if (i + 1 == payloads.length) {
        resolve(arr)
      }
    }
  })
}
async function getFifo() {
  let con = [
    {
      $match: {

      }
    },
    {
      $sort: {
        fifo: -1
      }
    },

    {
      $limit: 1
    }
  ]

  let data = await STOCK.aggregate(con)
  let newCode = moment().format('YYMM00001')
  if (data?.length != 0) {
    let current = moment().format('YYMM')
    let codeData = data[0]
    let text1 = codeData.fifo.slice(0, 4)
    if (current == text1) {
      let text2 = codeData.fifo.slice(4)
      text2 = (Number(text2) + 1).toString().padStart(5, '0')
      newCode = text1 + text2
    }
  }
  return newCode
}

router.get("/code", async (req, res, next) => {
  try {
    let con = [
      {
        $match: {

        }
      },
      {
        $sort: {
          fifo: -1
        }
      },
      {
        $limit: 1
      }
    ]

    let data = await STOCK.aggregate(con)
    let newCode = moment().format('YYMM00001')
    if (data?.length != 0) {
      let current = moment().format('YYMM')
      let codeData = data[0]
      let text1 = codeData.fifo.slice(0, 4)
      if (current == text1) {
        let text2 = codeData.fifo.slice(4)
        text2 = (Number(text2) + 1).toString().padStart(5, '0')
        newCode = text1 + text2
      }
    }
    res.json({ code: newCode })
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


router.post("/get_fifo", async (req, res, next) => {
  try {
    let payloads = req.body
    console.log(payloads);

    let data = await STOCK.aggregate(
      [
        {
          $match: {
            product_id: payloads.product_id,
            active: true,
            fifo: {
              $nin: payloads.ignore
            }
          }
        },
        { $sort: { expire_date: 1 } },
        {
          $limit: 1
        }

      ]
    )
    res.json(data[0]); // Return the result of the update operation
  } catch (error) {
    res.sendStatus(500);
  }
});



router.get("/two_active", async (req, res, next) => {
  try {
    let { fifo, lot, category_id, product_id } = req.query
    let con = [
      {
        $match: {
          active: {
            $in: [true, false]
          }
        }
      }
    ]
    if (fifo) {
      fifo = JSON.parse(fifo)
      con.push({
        $match: {
          fifo: {
            $in: fifo
          }
        }
      })
    }
    if (lot) {
      lot = JSON.parse(lot)
      con.push({
        $match: {
          lot: {
            $in: lot
          }
        }
      })
    }
    if (category_id) {
      category_id = JSON.parse(category_id)
      con.push({
        $match: {
          category_id: {
            $in: category_id
          }
        }
      })
    }
    if (product_id) {
      product_id = JSON.parse(product_id)
      con.push({
        $match: {
          product_id: {
            $in: product_id
          }
        }
      })
    }
    const data = await STOCK.aggregate(con);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});





router.post("/getDataChart", async (req, res, next) => {
  try {
    let payloads = req.body
    console.log(payloads);
    console.log(payloads.product_id ? payloads.product_id : undefined);


    let data = await STOCK.aggregate(
      [
        {
          $match: {
            product_id: payloads.product_id || { $exists: true },
            'action.status': {
              $in: [
                RegExp('receive', 'i'),
                RegExp('withdraw', 'i')
              ]
            }
          }
        },
        {
          $match: {
            'action.timeStamp': {
              $gte: moment(payloads.year).startOf('year').toDate(),
              $lte: moment(payloads.year).endOf('year').toDate()
            }
          }
        },
        { $unwind: '$action' },
        {
          $project: {
            i_month: { $month: '$action.timeStamp' },
            month: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        1
                      ]
                    },
                    then: 'jan'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        2
                      ]
                    },
                    then: 'feb'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        3
                      ]
                    },
                    then: 'mar'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        4
                      ]
                    },
                    then: 'apr'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        5
                      ]
                    },
                    then: 'may'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        6
                      ]
                    },
                    then: 'jun'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        7
                      ]
                    },
                    then: 'jul'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        8
                      ]
                    },
                    then: 'aug'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        9
                      ]
                    },
                    then: 'sep'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        10
                      ]
                    },
                    then: 'oct'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        11
                      ]
                    },
                    then: 'nov'
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $month: '$action.timeStamp'
                        },
                        12
                      ]
                    },
                    then: 'dec'
                  }
                ],
                default: 'unknown'
              }
            },
            year: { $year: '$action.timeStamp' },
            qty: '$action.qty',
            status: '$action.status'
          }
        },
        {
          $group: {
            _id: {
              i_month: '$i_month',
              month: '$month',
              year: '$year',
              status: '$status'
            },
            totalQty: { $sum: '$qty' }
          }
        },
        {
          $addFields: {
            monthYear: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: [
                    { $lt: ['$_id.month', 10] },
                    {
                      $concat: [
                        '0',
                        { $toString: '$_id.month' }
                      ]
                    },
                    { $toString: '$_id.month' }
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              month: '$_id.i_month',
              monthName: '$_id.month',
              year: '$_id.year'
            },
            receive: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$_id.status',
                      regex: RegExp('receive', 'i')
                    }
                  },
                  '$totalQty',
                  0
                ]
              }
            },
            withdraw: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$_id.status',
                      regex: RegExp('withdraw', 'i')
                    }
                  },
                  '$totalQty',
                  0
                ]
              }
            }
          }
        },
        {
          $addFields: {
            monthYear: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: [
                    { $lt: ['$_id.month', 10] },
                    {
                      $concat: [
                        '0',
                        { $toString: '$_id.month' }
                      ]
                    },
                    { $toString: '$_id.month' }
                  ]
                }
              ]
            }
          }
        },
        {
          $project: {
            _id: 0,
            i_month: '$_id.month',
            month: '$_id.monthName',
            year: '$_id.year',
            monthYear: 1,
            receive: 1,
            withdraw: 1
          }
        },
        { $sort: { month: -1 } }
      ]
    );


    res.json(data);

  } catch (error) {
    res.sendStatus(500);
  }
});



router.post("/getStockClean", async (req, res, next) => {
  try {
    let payloads = req.body
    let data = await STOCK.aggregate(
      [
        {
          $match: {
            active: true
          }
        },
        {
          $group: {
            _id: {
              product_id: '$product_id',
              category_id: '$category_id'
            },
            totalQty: { $sum: '$balance' }
          }
        },
        {
          $project: {
            _id: 0,
            product_id: '$_id.product_id',
            category_id: '$_id.category_id',
            Qty: '$totalQty'
          }
        }
      ]
    )
    res.json(data);

  } catch (error) {
    res.sendStatus(500);
  }
});



router.post("/getStockSortTop10", async (req, res, next) => {
  try {
    let payloads = req.body
    console.log(payloads);

    let data = await STOCK.aggregate(
      [
        {
          $match: {
            'action.status': {
              $in: [
                RegExp('receive', 'i'),
                RegExp('withdraw', 'i')
              ]
            }
          }
        },
        {
          $match: {
            'action.timeStamp': {
              $gte: moment(payloads.start).startOf('day').toDate(),
              $lte: moment(payloads.end).endOf('day').toDate()
            }
          }
        },
        { $unwind: '$action' },
        {
          $project: {
            product_id: "$product_id",
            product_name: "$product_name",
            qty: "$action.qty",
            status: "$action.status",
            timeStamp: "$action.timeStamp"
          }
        },
        {
          $group: {
            _id: {
              product_id: "$product_id",
              product_name: "$product_name",
              status: "$status",
              timeStamp: "$timeStamp"
            },
            totalQtyPerTime: {
              $sum: "$qty" // Sum quantities per timeStamp
            }
          }
        },
        {
          $group: {
            _id: {
              product_id: "$_id.product_id",
              product_name: "$_id.product_name",
              status: "$_id.status"
            },
            totalQty: {
              $sum: "$totalQtyPerTime" // Sum quantities across timeStamps
            },
            timeStamps: {
              $push: {
                timeStamp: "$_id.timeStamp",
                qty: "$totalQtyPerTime" // Include quantity per timestamp
              }
            }
          }
        },
        {
          $match: {
            "_id.status": /withdraw/i
          }
        },
        {
          $project: {
            _id: 0,
            product_id: "$_id.product_id",
            product_name: "$_id.product_name",
            status: "$_id.status",
            totalQty: "$totalQty",
            timeStamps: "$timeStamps" // Include the timeStamps and their quantities
          }
        },
        {
          $sort: {
            totalQty: -1
          }
        },
        {
          $limit: 10
        }
      ],
    );

    res.json(data);

  } catch (error) {
    res.sendStatus(500);
  }
});



router.post("/getExpireTop10", async (req, res, next) => {
  try {
    let payloads = req.body
    let data = await STOCK.aggregate(
      [
        {
          $match: {
            active: true
          }
        },
        {
          $sort: {
            expire_date: 1
          }
        },
        {
          $group: {
            _id: {
              product_id: "$product_id"
            },
            expire_date: {
              $min: "$expire_date"
            },
            fifo: {
              $first: "$fifo"
            },
            product_name: {
              $first: "$product_name"
            }
          }
        },
        {
          $project: {
            _id: 0,
            product_id: "$_id.product_id",
            product_name: 1,
            expire_date: 1,
            fifo: 1
          }
        },
        {
          $sort: {
            expire_date: 1
          }
        },
        {
          $limit: 10
        }
      ]
    );

    res.json(data);

  } catch (error) {
    res.sendStatus(500);
  }






});



router.post("/getQtyClean", async (req, res, next) => {
  try {
    let payloads = req.body
    let data = await STOCK.aggregate(
      [
        {
          $match: {
            active: true
          }
        },
        {
          $group: {
            _id: {
              product_id: "$product_id",
              product_name: "$product_name"
            },
            qty: {
              $sum: "$balance"
            }
          }
        },
        {
          $project: {
            _id: 0,
            product_id: "$_id.product_id",
            product_name: "$_id.product_name",
            qty: "$qty"
          }
        }
      ]
    );

    res.json(data);

  } catch (error) {
    res.sendStatus(500);
  }






});




module.exports = router;
