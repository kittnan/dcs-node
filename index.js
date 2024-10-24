let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let app = express();
let morgan = require("morgan");
let mongoose = require("mongoose");
let compression = require("compression");
let fileUpload = require("express-fileupload");

mongoose.set("strictQuery", false);

const dotenv = require("dotenv");
const jwt = require("jsonwebtoken")

// dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
dotenv.config({ path: `.env` });

console.log("PORT:", process.env.PORT);
let mongooseConnect = require("./connect");
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log("Listening on  port " + server.address().port);
});

app.use(morgan("tiny"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(compression());
app.use(fileUpload())


app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST ,PUT ,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-with,Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const jwtValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401);

    const token = req.headers["authorization"].replace("Bearer ", "");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        return res.sendStatus(403); // Forbidden
      }
      next(); // Move to the next middleware
    });
  } catch (error) {
    console.error("JWT validation error:", error.message);
    return res.sendStatus(403); // Forbidden
  }
};



// let Users = require("./src/routes/users");
// app.use("/users", jwtValidate, Users);

app.use("/auth", require("./src/routes/auth"));

app.use("/machine", jwtValidate, require("./src/routes/master-machine"));

app.use("/user", require("./src/routes/master-user"));

app.use("/report", jwtValidate, require("./src/routes/report"));

app.use("/report-special", jwtValidate, require("./src/routes/report-special"));


app.use("/serviceTypeOption", jwtValidate, require("./src/routes/master-serviceTypeOption"));

app.use("/pm-list", jwtValidate, require("./src/routes/master-pm-list"));


app.use("/report-pm", jwtValidate, require("./src/routes/report-pm"));


app.use("/report-pm-special", jwtValidate, require("./src/routes/report-pm-special"));


app.use("/tasks", jwtValidate, require("./src/routes/tasks"));


app.use("/pm-plan", jwtValidate, require("./src/routes/pm-plan"));

app.use("/master-category", jwtValidate, require("./src/routes/master-category"));
app.use("/master-product", jwtValidate, require("./src/routes/master-product"));
app.use("/master-customer", jwtValidate, require("./src/routes/master-customer"));
app.use("/master-location", jwtValidate, require("./src/routes/master-location"));
app.use("/order", jwtValidate, require("./src/routes/order"));
app.use("/stock", jwtValidate, require("./src/routes/stock"));
app.use("/user-store", jwtValidate, require("./src/routes/master-user-store"));



app.get('/', (req, res) => {
  try {
    res.send('ok')
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})






module.exports = app;
