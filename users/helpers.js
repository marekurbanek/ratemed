const sql = require("mssql/msnodesqlv8")
const auth = require("../authentication/authentication")
module.exports = {

  getExpirationTimeFromToken: (token) => {
    let decodedToken = auth.decode(token)
    return decodedToken.payload.exp - decodedToken.payload.iat
  },

  userExist: (req, res, next) => {
    const request = new sql.Request()
    request.query(`SELECT * FROM USERS WHERE USERNAME = '${req.body.username}'`)
      .then(result => {
        if (result.recordset.length > 0) {
          res.status(400).json({
            errorMessage: "User with that username allready exist."
          })
        } else {
          next()
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}