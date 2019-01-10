const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")

const startConnection = require("./db")

const usersRoutes = require("./users/users")
const doctorsRoutes = require("./doctors/doctors")
const commentsRoutes = require("./comments/comments")

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

app.use("/users", usersRoutes)
app.use("/doctors", doctorsRoutes)
app.use("/comments", commentsRoutes)

app.listen(5000, function () {
  console.log("Server is running..")
  startConnection()
})
