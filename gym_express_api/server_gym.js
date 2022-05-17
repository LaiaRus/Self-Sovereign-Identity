// ===================== .env FILE REQUIREMENT =====================
require('dotenv').config()
// ===================== HTML CONSTANTS =====================
const cors = require('cors')
// ===================== EXPRESS CONSTANTS AND VARIABLES =====================
const logger = require('morgan')
const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json() // To receive JSON bodies
// ===================== EXPRESS APP CONFIGURATION =====================
app.use(logger('dev')) // To console log when POST is being called
app.use(cors({origin: 'http://localhost:3000'}))
app.use(bodyParser.urlencoded({ extended: true })) // needed to retrieve html form fields
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
app.post('/postVerifyVerifiablePresentation', jsonParser, (req, res) => {
  const vp = req.body.vp
  const studentDid = req.body.did.did
  const subjectVp = vp.verifiableCredential[0].credentialSubject.id.did
  const universityName = vp.verifiableCredential[0].credentialSubject.claims.universityName
  const student = vp.verifiableCredential[0].credentialSubject.claims.student
  const expDate = vp.verifiableCredential[0].credentialSubject.claims.expDate
  if (studentDid === subjectVp && universityName === 'Monsters University' && student && new Date(expDate) > new Date()) {
    res.status(200).json(true)
  }
  else {
    res.status(200).json(false)
  }
})
// ===================== Listen on provided port, on all network interfaces =====================
// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Express Server listening on port ${port}`)); 