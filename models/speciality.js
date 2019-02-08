const Sequelize = require('sequelize')
const db = require('../db')

const Speciality = db.define('speciality', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  speciality: {
    type: Sequelize.STRING,
    allowNull: false,
  }
}, {
  timestamps: false
})

module.exports = Speciality
