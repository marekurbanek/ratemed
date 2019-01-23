const sql = require("mssql/msnodesqlv8")

module.exports = {
  getUserIdByUsername: (username) => {
    let request = new sql.Request()
    return request.query(`SELECT id FROM USERS WHERE USERNAME = '${username}'`)
  }
}
