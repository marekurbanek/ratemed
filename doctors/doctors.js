const express = require("express")
const sql = require("mssql/msnodesqlv8");

const router = express.Router({
  mergeParams: true
})

router.get("/", (req, res) => {
  const request = new sql.Request();

  request.query(`SELECT * FROM doctors`)
    .then(doctors => {
      res.json(doctors.recordset)
    })
    .catch(err => {
      console.log(err);
    })
})

router.get("/:id", (req, res) => {
  const request = new sql.Request();

  request.query(`SELECT * FROM doctors where id = ${req.params.id}`)
    .then(doctors => {
      res.json(doctors.recordset)
    })
    .catch(err => {
      console.log(err);
    })
})

router.post('/', function (req, res) {
  const request = new sql.Request();
  const query = `INSERT INTO doctors (name, speciality, image) VALUES ('${req.body.name}', '${req.body.speciality}', '${req.body.image}')`;

  request.query(query)
    .then(result => {
      res.send("new Doctor created");
      console.log(result)
    })
    .catch(err => {
      console.log(err);
    })
})


module.exports = router;
