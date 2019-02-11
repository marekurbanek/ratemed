const express = require('express')
const auth = require('../authentication/authentication')
const Comment = require('../models/comment')
const db = require('../db')

const router = express.Router({
  mergeParams: true
})

router.get('/latest', (req, res) => {
  db.query(`
    select id, text, rating, t1.doctorId, userId, createdAt
    from comments t1
    inner join
    (
      select max(createdAt) mxdate, doctorId
      from comments
      group by doctorId
    ) t2
      on t1.doctorId = t2.doctorId
      and t1.createdAt = t2.mxdate
  `).spread((results, metadata) => {
    res.json(metadata)
  })
})

router.get('/:id', (req, res) => {
  Comment.findAll({
      where: {
        doctorId: req.params.id
      }
    })
    .then(comments => {
      res.json(comments)
    })
    .catch(err => {
      console.log(err)
    })
})


router.post('/', auth.verify, (req, res) => {
  Comment.create({
      doctorId: req.body.doctorId,
      userId: req.userId,
      text: req.body.comment,
      rating: req.body.rating
    })
    .then(() => {
      res.status(201).json({message: 'Comment added'})
    })
    .catch(err => {
      console.log(err)
    })
})

router.delete('/:id', auth.verify, (req, res) => {
  Comment.findById(req.params.id)
    .then(comment => {
      comment.destroy({
          force: true
        })
        .then(() => {
          res.status(201).json({
            message: 'Doctor removed'
          })
        })
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router