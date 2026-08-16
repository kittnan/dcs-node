const moment = require("moment");
const ORDER = require("../models/order");

function buildBadRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function parseIntegerParam(value, fieldName, defaultValue, { min, max }) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw buildBadRequest(`${fieldName} must be an integer`);
  }
  if (min !== undefined && parsed < min) {
    throw buildBadRequest(`${fieldName} must be >= ${min}`);
  }
  if (max !== undefined && parsed > max) {
    throw buildBadRequest(`${fieldName} must be <= ${max}`);
  }

  return parsed;
}

function parseJsonParam(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw buildBadRequest(`${fieldName} must be a valid JSON string`);
  }
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseStringArrayParam(value, fieldName) {
  const parsed = parseJsonParam(value, fieldName);
  if (parsed === undefined) {
    return undefined;
  }
  if (!Array.isArray(parsed)) {
    throw buildBadRequest(`${fieldName} must be a JSON array string`);
  }

  const values = parsed
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return values;
}

function parseDateRangeParam(value, fieldName) {
  const parsed = parseJsonParam(value, fieldName);
  if (parsed === undefined) {
    return undefined;
  }
  if (!Array.isArray(parsed) || parsed.length !== 2) {
    throw buildBadRequest(`${fieldName} must be [startDate, endDate]`);
  }

  const [startRaw, endRaw] = parsed;
  if (typeof startRaw !== "string" || typeof endRaw !== "string") {
    throw buildBadRequest(`${fieldName} dates must be strings`);
  }

  const startMoment = moment(startRaw, "YYYY-MM-DD", true);
  const endMoment = moment(endRaw, "YYYY-MM-DD", true);
  if (!startMoment.isValid() || !endMoment.isValid()) {
    throw buildBadRequest(`${fieldName} dates must be in YYYY-MM-DD format`);
  }
  if (endMoment.isBefore(startMoment, "day")) {
    throw buildBadRequest(`${fieldName} end date must be greater than or equal to start date`);
  }

  return {
    $gte: startMoment.startOf("day").toDate(),
    $lte: endMoment.endOf("day").toDate(),
  };
}

function parseSortParam(value) {
  const parsed = parseJsonParam(value, "sort");
  if (parsed === undefined) {
    return { createdAt: -1 };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw buildBadRequest("sort must be a JSON object string");
  }

  const entries = Object.entries(parsed);
  if (entries.length === 0) {
    return { createdAt: -1 };
  }

  const sort = {};
  for (const [field, direction] of entries) {
    if (direction !== 1 && direction !== -1) {
      throw buildBadRequest("sort direction must be 1 or -1");
    }
    sort[field] = direction;
  }

  return sort;
}

function buildStatusFilter(statusValues) {
  if (!statusValues || statusValues.length === 0) {
    return undefined;
  }

  const normalizedStatus = statusValues.map((status) => status.toLowerCase());
  if (normalizedStatus.includes("all")) {
    return undefined;
  }

  const hasBackOrder = normalizedStatus.includes("backorder");
  const standardStatuses = normalizedStatus.filter((status) => status !== "backorder");

  const conditions = [];
  if (standardStatuses.length > 0) {
    conditions.push({ status: { $in: standardStatuses } });
  }

  if (hasBackOrder) {
    conditions.push({
      $and: [
        { status: "packing" },
        { products: { $elemMatch: { qty_withdraw: { $gt: 0 } } } },
      ],
    });
  }

  if (conditions.length === 0) {
    return undefined;
  }
  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $or: conditions };
}

function buildContainsFilter(field, values) {
  if (!values || values.length === 0) {
    return undefined;
  }

  return {
    [field]: {
      $in: values.map((value) => new RegExp(escapeRegex(value), "i")),
    },
  };
}

async function getOrderTable(req, res) {
  try {
    const page = parseIntegerParam(req.query.page, "page", 1, { min: 1 });
    const limit = parseIntegerParam(req.query.limit, "limit", 10, { min: 1, max: 100 });

    const statusValues = parseStringArrayParam(req.query.status, "status");
    const poNumberValues = parseStringArrayParam(req.query.po_number, "po_number");
    const customerNameValues = parseStringArrayParam(req.query.customer_name, "customer_name");

    const orderDateRange = parseDateRangeParam(req.query.order_date, "order_date");
    const poDateRange = parseDateRangeParam(req.query.po_date, "po_date");
    const deliveryDateRange = parseDateRangeParam(req.query.delivery_date, "delivery_date");

    const sort = parseSortParam(req.query.sort);

    const andFilters = [];

    const statusFilter = buildStatusFilter(statusValues);
    if (statusFilter) {
      andFilters.push(statusFilter);
    }

    const poNumberFilter = buildContainsFilter("po_number", poNumberValues);
    if (poNumberFilter) {
      andFilters.push(poNumberFilter);
    }

    const customerNameFilter = buildContainsFilter("customer_name", customerNameValues);
    if (customerNameFilter) {
      andFilters.push(customerNameFilter);
    }

    if (orderDateRange) {
      andFilters.push({ order_date: orderDateRange });
    }
    if (poDateRange) {
      andFilters.push({ po_date: poDateRange });
    }
    if (deliveryDateRange) {
      andFilters.push({ delivery_date: deliveryDateRange });
    }

    const filter = andFilters.length > 0 ? { $and: andFilters } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ORDER.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      ORDER.countDocuments(filter),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return res.json({
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }

    console.log("Error in getOrderTable:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getOrderTable,
};