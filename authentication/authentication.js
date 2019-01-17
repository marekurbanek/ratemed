const fs = require('fs')
const jwt = require('jsonwebtoken')

var privateKEY = fs.readFileSync('./authentication/keys/private.key', 'utf8')
var publicKEY = fs.readFileSync('./authentication/keys/public.key', 'utf8')

module.exports = {
  sign: (payload) => {
    let options = {
      expiresIn: '600000ms',
      algorithm:  "RS256"
    }
    return jwt.sign(payload, privateKEY, options)
  },
  verify: (req, res, next) => {
    let options = {
      expiresIn: '600000ms',
      algorithm:  ["RS256"]
    }
    try {
      let token = req.headers['authorization']
      if (token) {
        if (jwt.verify(token, publicKEY, options)) {
          next()
        }
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