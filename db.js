var sql = require("mssql/msnodesqlv8");

var dbConfig = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={SQL Server Native Client 11.0};Server={localhost\\SQLExpress};Database={nodejs};Trusted_Connection={yes};'
};

module.exports = function startConnection() {
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.log("Error while connecting database :- " + err);
      sql.close();
    } else {
      console.log("Connected succesfully")
    }
  });
}
