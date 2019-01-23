const express = require("express")
const sql = require("mssql/msnodesqlv8")
const bcrypt = require("bcrypt")
const auth = require("../authentication/authentication")
const utils = require("../shared/utils")

const router = express.Router({
  mergeParams: true
})

router.post('/register', (req, res) => {
  // Should check if user exists
  const request = new sql.Request()
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (!err) {
      let username = req.body.username
      const query = `INSERT INTO users VALUES ('${username}', '${hash}')`
      request.query(query)
        .then(() => {
          utils.getUserIdByUsername(username)
          .then(result => {
            let token = auth.sign({username})
            let userId = result.recordset[0].id
            res.json({token, expirationTime: getExpirationTimeFromToken(token), username, userId })
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
              let token = auth.sign({username})
              let userId = result.recordset[0].id
              res.json({token, expirationTime: getExpirationTimeFromToken(token), username, userId })
            })
          } else {
            res.send("Password is incorrect!")
          }
        })
        .catch(err => {
          res.send("Upss... Something went wrong " + err)
        })
    })
    .catch(err => {
      console.log(err)
      res.send("User with thath username doesn't exist ")
    })
})

router.get('/data', auth.verify, (req, res) => {
  let user = {
    username: req.username,
    userId: req.userId
  }
  res.json(user)
})

getExpirationTimeFromToken = (token) => {
  let decodedToken = auth.decode(token)
  return decodedToken.payload.exp - decodedToken.payload.iat
}

module.exports = router
