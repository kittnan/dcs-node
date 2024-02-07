let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;

const jwt = require("jsonwebtoken")
require("dotenv").config()

const USERS = require("../models/users");

router.post("/login", async (req, res) => {
  const { name } = req.body

  let user = await USERS.aggregate([
    {
      $match: {
        username: name
      }
    }
  ])

  user = user?.length > 0 ? user[0] : null
  if (!user) {
    return res.send(400)
  }

  const access_token = jwtGenerate(user)
  const refresh_token = jwtRefreshTokenGenerate(user)

  user.refresh = refresh_token

  res.json({
    access_token,
    refresh_token,
  })
})

const jwtGenerate = (user) => {
  const accessToken = jwt.sign(
    { name: user.username, id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m", algorithm: "HS256" }
  )

  return accessToken
}

const jwtRefreshTokenGenerate = (user) => {
  const refreshToken = jwt.sign(
    { name: user.username, id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d", algorithm: "HS256" }
  )

  return refreshToken
}

const jwtValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401)

    const token = req.headers["authorization"].replace("Bearer ", "")

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) throw new Error(err)
    })
    next()
  } catch (error) {
    return res.sendStatus(403)
  }
}

router.get("/", jwtValidate, async (req, res) => {
  try {
    res.send(200)
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
})

const jwtRefreshTokenValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401)
    const token = req.headers["authorization"].replace("Bearer ", "")

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      console.log(req.user);
      if (err) throw new Error(err)

      req.user = decoded
      req.user.token = token
      delete req.user.exp
      delete req.user.iat
    })
    next()
  } catch (error) {
    console.log("🚀 ~ error:", error)
    return res.sendStatus(403)
  }
}

router.post("/refresh", jwtRefreshTokenValidate, async (req, res) => {
  let user = await USERS.aggregate([
    {
      $match: {
        username: req.body.username,
        _id: new ObjectId(req.body._id)
      }
    }
  ])

  user = user?.length > 0 ? user[0] : null

  if (!user) return res.sendStatus(401)

  const access_token = jwtGenerate(user)
  const refresh_token = jwtRefreshTokenGenerate(user)
  user.refresh = refresh_token

  return res.json({
    access_token,
    refresh_token,
  })
})



module.exports = router;
