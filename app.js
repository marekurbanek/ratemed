const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const fileUpload = require('express-fileupload');
const cors = require("cors")


const usersRoutes = require("./users/users")
// const doctorsRoutes = require("./doctors/doctors")
// const commentsRoutes = require("./comments/comments")

const db = require("./db")
// MODELS
const Comment = require("./models/comment")
const Doctor = require("./models/doctor")
const Speciality = require("./models/speciality")
const User = require("./models/user")

const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(express.static(__dirname + '/public'))
app.use(fileUpload())

app.use("/users", usersRoutes)
// app.use("/doctors", doctorsRoutes)
// app.use("/comments", commentsRoutes)

app.listen(5000, function () {
  console.log("Server is running..")

  Comment.belongsTo(Doctor)
  User.hasMany(Comment)
  Doctor.belongsTo(User)
  Speciality.belongsTo(Doctor)

  db.sync({force: true})
})
