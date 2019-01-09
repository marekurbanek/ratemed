const express = require("express")
const sql = require("mssql/msnodesqlv8");

const router = express.Router({
  mergeParams: true
})

router.get("/:id", (req, res) => {
  const request = new sql.Request();
  const doctorId = req.params.id

  request.query(`SELECT * FROM comments where doctorId = ${doctorId}`)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err);
    })
})


// DOUBTS REGARDING METHOD WITH USING ID
router.post("/:id", (req, res) => {
  const request = new sql.Request();
  const doctorId = req.params.id

  request.query(`INSERT INTO comments (doctorId, text, rating) VALUES ('${doctorId}', '${req.body.text}', '${req.body.rating}')`)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err);
    })
})

module.exports = router;
