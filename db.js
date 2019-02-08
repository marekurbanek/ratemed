const Sequelize = require('sequelize')

if (process.env.CLEARDB_DATABASE_URL) {
  module.exports = new Sequelize(process.env.CLEARDB_DATABASE_URL)
} else {
  module.exports = new Sequelize('ratemed', 'root', 'admin', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false
  })
}
