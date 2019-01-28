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
      res.json(doctors.recordset)
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
      console.log(doctors)
      res.json(doctors.recordset)
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/', (req, res) => {
  const request = new sql.Request()

  request.query(createDoctorQuery(req))
    .then((result) => {
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

const createDoctorQuery = (req) => {
  const specialities = req.body.specialities
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
                INSERT INTO doctors (name) VALUES ('${req.body.name}')
              
                SELECT @doctorId = @@IDENTITY
              
                INSERT INTO specialities
                  ( speciality, doctorId)
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

module.exports = router
