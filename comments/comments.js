const express = require("express")
const sql = require("mssql/msnodesqlv8")

const router = express.Router({
  mergeParams: true
})

router.get("/:id", (req, res) => {
  const request = new sql.Request()
  const doctorId = req.params.id

  request.query(`SELECT * FROM comments where doctorId = ${doctorId}`)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})


router.post("/", (req, res) => {
  const request = new sql.Request()
  
  request.query(`INSERT INTO comments (doctorId, text, rating) VALUES ('${req.body.doctorId}', '${req.body.comment}', ${req.body.rating})`)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router
