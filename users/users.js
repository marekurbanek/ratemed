const express = require("express")
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcrypt");

const router = express.Router({
  mergeParams: true
})

router.post('/', function (req, res) {
  const request = new sql.Request();
  const query = `INSERT INTO users VALUES ('${req.body.username}', '${req.body.password}')`;
  request.query(query)
    .then(result => {
      res.send("new user created");
      console.log(result)
    })
    .catch(err => {
      console.log(err);
    })
})

router.post('/register', function (req, res) {
  const request = new sql.Request();

  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (!err) {
      const query = `INSERT INTO users VALUES ('${req.body.username}', '${hash}')`;

      request.query(query)
        .then(result => {
          res.send("new user created");
          console.log(result)
        })
        .catch(err => {
          console.log(err);
        })
    } else {
      console.log(err);
    }
  })
})

router.post('/login', function (req, res) {
  const request = new sql.Request();
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

module.exports = router;
