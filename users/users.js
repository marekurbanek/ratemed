const express = require("express")
const sql = require("mssql/msnodesqlv8")
const bcrypt = require("bcrypt")
const auth = require("../authentication/authentication")

const router = express.Router({
  mergeParams: true
})

router.post('/register', (req, res) => {
  const request = new sql.Request()
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (!err) {
      const query = `INSERT INTO users VALUES ('${req.body.username}', '${hash}')`
      request.query(query)
        .then(() => {
          let token = auth.sign({username: req.body.username})
          res.json(token)
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
  getUserPasswordQuery = `SELECT password FROM users WHERE username = '${req.body.username}'`
  request.query(getUserPasswordQuery)
    .then(user => {
      const hash = user.recordset[0].password
      bcrypt.compare(req.body.password, hash)
        .then(result => {
          if (result) {
            let token = auth.sign({username: req.body.username})
            res.json(token)
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

router.get("/", (req, res) => {
  let token = auth.getTokenFromHeader(req)
  if (token) {
    let verified = auth.verify(token)
    if (verified) {
      const request = new sql.Request()
      query = `SELECT * FROM users`
      request.query(query)
        .then(users => {
          res.json(users)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
})

module.exports = router