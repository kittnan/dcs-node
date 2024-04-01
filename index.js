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

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

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

let AUTH_ROUTE = require("./src/routes/auth");
app.use("/auth", AUTH_ROUTE);

let MACHINE_ROUTE = require("./src/routes/master-machine");
app.use("/machine", jwtValidate, MACHINE_ROUTE);

let USER_ROUTE = require("./src/routes/master-user");
app.use("/user", USER_ROUTE);

let REPORT_ROUTE = require("./src/routes/report");
app.use("/report", jwtValidate, REPORT_ROUTE);

let REPORT_SPECIALIST_ROUTE = require("./src/routes/report-special");
app.use("/report-special", jwtValidate, REPORT_SPECIALIST_ROUTE);


let SERVICE_TYPE_OPTION_ROUTE = require("./src/routes/master-serviceTypeOption");
app.use("/serviceTypeOption", jwtValidate, SERVICE_TYPE_OPTION_ROUTE);

let PM_LIST = require("./src/routes/master-pm-list");
app.use("/pm-list", jwtValidate, PM_LIST);


let REPORT_PM_ROUTE = require("./src/routes/report-pm");
app.use("/report-pm", jwtValidate, REPORT_PM_ROUTE);


let REPORT_PM_SPECIAL_ROUTE = require("./src/routes/report-pm-special");
app.use("/report-pm-special", jwtValidate, REPORT_PM_SPECIAL_ROUTE);




app.get('/', (req, res) => {
  try {
    res.send('ok')
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})






module.exports = app;
