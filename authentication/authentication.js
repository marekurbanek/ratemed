const fs = require('fs')
const jwt = require('jsonwebtoken')

var privateKEY = fs.readFileSync('./authentication/keys/private.key', 'utf8')
var publicKEY = fs.readFileSync('./authentication/keys/public.key', 'utf8')

module.exports = {
  sign: (payload) => {
    let options = {
      expiresIn: '600000ms'
    }
    return jwt.sign(payload, privateKEY, options)
  },
  verify: (token) => {
    try {
      return jwt.verify(token, publicKEY)
    } catch (err) {
      console.log(err)
      return false
    }
  },
  getTokenFromHeader: (req) => {
    return req.headers['authorization']
  },
  decode: (token) => {
    return jwt.decode(token, {
      complete: true
    })
  }
}