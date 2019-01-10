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

  request.query(`SELECT name, speciality, image, text, c.id, rating, created from doctors d
                INNER JOIN comments c
                on d.id = c.doctorId
                where d.id = ${req.params.id}`)
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
      res.status(201).json({message: 'OK'})
    })
    .catch(err => {
      console.log(err);
    })
})


module.exports = router;
