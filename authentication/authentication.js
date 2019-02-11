const fs = require('fs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const privateKEY = fs.readFileSync('./authentication/keys/private.key', 'utf8')
const publicKEY = fs.readFileSync('./authentication/keys/public.key', 'utf8')

let options = {
  expiresIn: '36000000ms',
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
        User.find({where: {username: username}})
          .then(user => {
            req.userId = user.id
            req.username = user.username
            next()
          })
          .catch(err => {
            console.log(err)
          })
      }
    } catch (err) {
      console.log(err)
    }
  },
  decode: (token) => {
    return jwt.decode(token, {
      complete: true
    })
  }
}
