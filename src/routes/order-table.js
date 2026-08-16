const express = require("express");
const router = express.Router();
const { getOrderTable } = require("../controllers/order-table.controller");

router.get("/order-table", getOrderTable);

module.exports = router;