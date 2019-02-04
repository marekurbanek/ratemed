const express = require("express")
const sql = require("mssql/msnodesqlv8")

const router = express.Router({
  mergeParams: true
})

router.get("/", (req, res) => {
  const request = new sql.Request()
  const query = `SELECT d.id, d.name, s.speciality, d.image, avg(c.rating) rating
                from doctors d
                INNER JOIN specialities s on d.id = s.doctorId
                LEFT JOIN comments c on d.id = c.doctorId
                group by d.id, d.name, s.speciality, d.image`

  request.query(query)
    .then(doctors => {
      res.json(transformDoctorsToSingleRecordWithSpecialitiesArray(doctors.recordset))
    })
    .catch(err => {
      console.log(err)
    })
})

router.get("/:id", (req, res) => {
  const request = new sql.Request()
  let query = `SELECT d.id, d.name, s.speciality, d.image, avg(c.rating) rating
              from doctors d
              INNER JOIN specialities s on d.id = s.doctorId
              LEFT JOIN comments c on d.id = c.doctorId
              where d.id = ${req.params.id}
              group by d.id, d.name, s.speciality, d.image`
              
  request.query(query)
    .then(doctors => {
      res.json(transformDoctorSpecialitiesToSingleRecord(doctors.recordset))
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/', (req, res) => {
  const request = new sql.Request()
  const imageUrl = checkIfFileExistAndSave(req)

  request.query(createDoctorQuery(req, imageUrl))
    .then(() => {
      res.status(201).json({message: 'OK'})
    })
    .catch(err => {
      console.log(err);
    })
})

router.delete('/:id', (req, res) => {
  const request = new sql.Request()
  const query = `DELETE FROM doctors WHERE id=${req.params.id}`
  request.query(query)
    .then(() => {
      res.status(201).json({message: 'Doctor removed'})
    })
    .catch(err => {
      console.log(err)
    })
})

const createDoctorQuery = (req, imageUrl) => {
  const specialities = req.body.specialities.split(",");
  let values = ''
  for (let i = 0; i < specialities.length; i++) {
    if(i === specialities.length - 1) {
      values = values + `('${specialities[i]}', @doctorId)`
    } else {
      values = values + `('${specialities[i]}', @doctorId),`
    }
  }
  let query = `BEGIN TRY
                BEGIN TRANSACTION

                Declare @doctorId int
                INSERT INTO doctors (name, image) VALUES ('${req.body.name}', '${imageUrl}')
              
                SELECT @doctorId = @@IDENTITY
              
                INSERT INTO specialities
                  ( speciality, doctorId )
                VALUES
                  ${values}
                  
                COMMIT TRAN
              END TRY
              BEGIN CATCH
                  IF @@TRANCOUNT > 0
                      ROLLBACK TRAN
              END CATCH `
  return query
}

transformDoctorsToSingleRecordWithSpecialitiesArray = (doctors) => {
  return addSpecialitiesToDoctors(getAllSpecialities(doctors), getDistinctDoctors(doctors, 'id'))
}
transformDoctorSpecialitiesToSingleRecord = (doctors) => {
  return addSpecialitiesToDoctors(getAllSpecialities(doctors), getDistinctDoctors(doctors, 'id'))[0]
}

getDistinctDoctors = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos);
}

getAllSpecialities = (specialities) => {
  return specialities.map(doctor => {
    return {
      doctorId: doctor.id,
      speciality: doctor.speciality
    }
  })
}

addSpecialitiesToDoctors = (specialities, distinctDoctors) => {
  specialities.forEach(spec => {
    let doctor = distinctDoctors.find( doctor => doctor.id === spec.doctorId)
    if(typeof doctor.speciality === 'string') {
      doctor.speciality = [`${spec.speciality}`]
    } else {
      doctor.speciality.push(spec.speciality)
    }
  })
  return distinctDoctors
}

checkIfFileExistAndSave = (req) => {
  if(req.files) {
    const image = req.files.profileImage
    let uniqueImageUrl = generateRandomString()
    image.mv(`./public/users/images/${uniqueImageUrl}.jpg`, (err) => {
			if(err){
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
  function generateRandomString() {
   return req.body.name + Math.random().toString(36).substring(7)
  }
}
module.exports = router
