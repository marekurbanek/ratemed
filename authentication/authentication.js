const fs = require('fs')
const jwt = require('jsonwebtoken')
const sql = require("mssql/msnodesqlv8")

var privateKEY = fs.readFileSync('./authentication/keys/private.key', 'utf8')
var publicKEY = fs.readFileSync('./authentication/keys/public.key', 'utf8')

let options = {
  expiresIn: '600000ms',
  algorithm: "RS256"
}

module.exports = {
  sign: (payload) => {
    return jwt.sign(payload, privateKEY, options)
  },
  verify: (req, res, next) => {
    try {
      let token = req.headers['authorization']
      if (jwt.verify(token, publicKEY, options)) {
        let username = jwt.verify(token, publicKEY, options).username
        getUserIdByUsername(username)
          .then(userId => {
            req.userId = userId.recordset[0].id
            req.username = username
            next()
          })
          .catch(err => {
            console.log(err)
          })
      }
    } catch (err) {
      console.log(err)
      res.status(403).json({
        error: "You are unauthorized to do this"
      })
    }
  },
  decode: (token) => {
    return jwt.decode(token, {
      complete: true
    })
  }
}

getUserIdByUsername = (username) => {
  let request = new sql.Request()
  return request.query(`SELECT id FROM USERS WHERE USERNAME = '${username}'`)
}
