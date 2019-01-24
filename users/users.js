const express = require("express")
const sql = require("mssql/msnodesqlv8")
const bcrypt = require("bcrypt")
const auth = require("../authentication/authentication")
const utils = require("../shared/utils")
const helpers = require("./helpers")

const router = express.Router({
  mergeParams: true
})

router.post('/register', helpers.userExist, (req, res) => {
  const request = new sql.Request()
  let username = req.body.username
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (!err) {
      const query = `INSERT INTO users VALUES ('${username}', '${hash}')`
      request.query(query)
        .then(() => {
          utils.getUserIdByUsername(username)
            .then(result => {
              let token = auth.sign({
                username
              })
              let userId = result.recordset[0].id
              res.json({
                token,
                expirationTime: helpers.getExpirationTimeFromToken(token),
                username,
                userId
              })
            })
            .catch(err => {
              console.log(err)
            })
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      console.log(err)
    }
  })
})

router.post('/login', (req, res) => {
  const request = new sql.Request()
  let username = req.body.username
  getUserPasswordQuery = `SELECT password FROM users WHERE username = '${username}'`
  request.query(getUserPasswordQuery)
    .then(user => {
      const hash = user.recordset[0].password
      bcrypt.compare(req.body.password, hash)
        .then(result => {
          if (result) {
            utils.getUserIdByUsername(username)
              .then(result => {
                let token = auth.sign({
                  username
                })
                let userId = result.recordset[0].id
                res.json({
                  token,
                  expirationTime: helpers.getExpirationTimeFromToken(token),
                  username,
                  userId
                })
              })
          } else {
            res.status(400).json({errorMessage: "Password is incorrect"})
          }
        })
        .catch(err => {
          res.send("Upss... Something went wrong " + err)
        })
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({errorMessage: "User with thath username doesn't exist"})
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