const express = require('express')
const sql = require('mssql/msnodesqlv8')
const auth = require('../authentication/authentication')

const router = express.Router({
  mergeParams: true
})

router.get('/latest', (req, res) => {
  const request = new sql.Request()

  request.query(`
      SELECT a.doctorId, a.text
      FROM comments a
      LEFT OUTER JOIN comments b
      ON a.doctorId = b.doctorId 
      AND a.created < b.created
      WHERE b.doctorId IS NULL
      ORDER BY a.created desc
    `)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})

router.get('/:id', (req, res) => {
  const request = new sql.Request()
  const doctorId = req.params.id

  request.query(`
      SELECT c.*, u.username FROM comments as c 
      INNER JOIN users as u on c.userId = u.id
      WHERE doctorId = ${doctorId} 
      ORDER BY c.created desc
    `)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})


router.post('/', auth.verify, (req, res) => {
  const request = new sql.Request()
  
  request.query(`INSERT INTO comments (doctorId, userId, text, rating) VALUES ('${req.body.doctorId}', ${req.userId}, '${req.body.comment}', ${req.body.rating})`)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})

router.delete('/:id', auth.verify, (req, res) => {
  const request = new sql.Request()
  
  request.query(`DELETE FROM comments WHERE id=${req.params.id}`)
    .then(comments => {
      res.json(comments.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router
