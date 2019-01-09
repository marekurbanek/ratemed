const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const usersRoutes = require("./users/users");
const doctorsRoutes = require("./doctors/doctors");
const commentsRoutes = require("./comments/comments");

const startConnection = require("./db");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.use("/users", usersRoutes);
app.use("/doctors", doctorsRoutes);
app.use("/comments", commentsRoutes);

app.listen(5000, function () {
  console.log("Server is running..");
  startConnection();
});
