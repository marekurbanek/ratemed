const express = require("express")
const sql = require("mssql/msnodesqlv8")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require('fs')

const privateKEY = fs.readFileSync('./users/private.key', 'utf8')
const publicKEY = fs.readFileSync('./users/public.key', 'utf8')

let i  = 'Mysoft corp';   
let s  = 'some@user.com';   
let a  = 'http://mysoftcorp.in';

const signOptions = {
  issuer:  i,
  subject:  s,
  audience:  a,
  expiresIn:  "12h",
  algorithm:  "RS256"
}

const router = express.Router({
  mergeParams: true
})

router.post('/', (req, res) => {
  const request = new sql.Request()
  const query = `INSERT INTO users VALUES ('${req.body.username}', '${req.body.password}')`
  request.query(query)
    .then(() => {
      const token = jwt.sign({}, privateKEY, signOptions);
      res.json(token)
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/register', (req, res) => {
  const request = new sql.Request()

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (!err) {
      const query = `INSERT INTO users VALUES ('${req.body.username}', '${hash}')`

      request.query(query)
        .then(result => {
          res.send("new user created")
          console.log(result)
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
            res.send("Password matches!")
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

module.exports = router
