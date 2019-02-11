const express = require("express")
const Doctor = require("../models/doctor")
const Speciality = require("../models/speciality")
const Comment = require("../models/comment")
const User = require("../models/user")

const router = express.Router({
  mergeParams: true
})

router.get("/", (req, res) => {
  Doctor.findAll({
      include: [{
        model: Speciality,
        attributes: ['speciality']
      }, {
        model: Comment
      }]
    })
    .then(doctors => {
      doctors.forEach(doctor => {
        doctor.dataValues.rating = getAverageRatingFromComments(doctor.dataValues.comments)
        doctor.dataValues.comments = []
      });
      res.json(doctors)
    })
    .catch(err => {
      console.log(err)
    })
})

router.get("/:id", (req, res) => {
  Doctor.findOne({
      where: {
        id: req.params.id
      },
      include: [{
        model: Speciality
      }, {
        model: Comment,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [{
          model: User,
          attributes: ['username', 'id']
        }]
      }]
    })
    .then(doctor => {
      doctor.dataValues.rating = getAverageRatingFromComments(doctor.dataValues.comments)
      res.json(doctor)
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/', (req, res) => {
  const imageUrl = checkIfFileExistAndSave(req)

  Doctor.create({
      name: req.body.name,
      image: imageUrl
    })
    .then(doctor => {
      const specialities = req.body.specialities.split(",").map(spec => {
        return {
          speciality: spec,
          doctorId: doctor.id
        }
      })
      Speciality.bulkCreate(specialities)
        .then(() => {
          res.status(201).json({
            message: 'OK'
          })
        })
        .catch(err => {
          console.log(err)
        })
    })
})


router.delete('/:id', (req, res) => {
  Doctor.findById(req.params.id)
    .then(doc => {
      doc.destroy({
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

getAverageRatingFromComments = (comments) => {
  if (comments.length > 0) {
    let ratings = comments.map(comment => comment.rating)
    return ratings.reduce((p, c) => p + c, 0) / ratings.length
  } else {
    return null
  }
}

checkIfFileExistAndSave = (req) => {
  if (req.files) {
    const image = req.files.profileImage
    const uniqueImageUrl = generateRandomString()
    image.mv(`./public/users/images/${uniqueImageUrl}.jpg`, (err) => {
      if (err) {
        console.log("Saving image went wrong" + err)
        return ''
      } else {
        return uniqueImageUrl
      }
    })
    return uniqueImageUrl
  } else {
    return ''
  }
}

function generateRandomString() {
  const doctorName = req.body.name.replace(/ /g, '_')
  return doctorName + Math.random().toString(36).substring(7)
}

module.exports = router