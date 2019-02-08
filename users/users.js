const express = require("express")
const bcrypt = require("bcrypt")
const auth = require("../authentication/authentication")
const helpers = require("./helpers")
const User = require("../models/user")

const router = express.Router({
  mergeParams: true
})

router.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (!err) {
      User.findOrCreate({
          where: {
            username: req.body.username
          },
          defaults: {
            username: req.body.username,
            password: hash
          }
        })
        .spread((user, created) => {
          if (!created) {
            res.status(400).json({
              errorMessage: "User with that username allready exist."
            })
          } else {
            let token = auth.sign({
              username: user.username
            })
            res.json({
              token,
              expirationTime: helpers.getExpirationTimeFromToken(token),
              username: user.username,
              userId: user.id
            })
          }
        })
    } else {
      console.log(err)
    }
  })
})

router.post('/login', (req, res) => {
  User.findOne({
      where: {
        username: req.body.username
      }
    })
    .then(user => {
      bcrypt.compare(req.body.password, user.password)
        .then(result => {
          if (result) {
            let token = auth.sign({
              username: user.username
            })
            res.json({
              token,
              expirationTime: helpers.getExpirationTimeFromToken(token),
              username: user.username,
              userId: user.id
            })
          } else {
            res.status(400).json({
              errorMessage: "Password is incorrect"
            })
          }
        })
    })
    .catch(err => {
      res.status(400).json({
        errorMessage: "User with thath username doesn't exist"
      })
    })
})

router.get('/data', auth.verify, (req, res) => {
  let user = {
    username: req.username,
    userId: req.userId
  }
  res.json(user)
})

module.exports = router
