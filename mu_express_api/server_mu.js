// ===================== .env FILE REQUIREMENT =====================
require('dotenv').config()
// ===================== HTML CONSTANTS =====================
const cors = require('cors')
// ===================== EXPRESS CONSTANTS AND VARIABLES =====================
const express = require('express'); //Line 1
const app = express(); //Line 2
const port = process.env.PORT || 5000; //Line 3
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json() // Per rebre JSON bodies
// ===================== JWT CONSTANTS AND VARIABLES =====================
const jwtSecret = require('crypto').randomBytes(16) // 16*8= 256 random bits // It's a random secret to check the HMAC-SHA256 signature of every JWT
const session = require("express-session")
const logger = require('morgan')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const scryptPbkdf = require('scrypt-pbkdf')
const fs = require('fs')
const UNIVERSITY_DID = 'did:ethr:ropsten:0x03d8fc8ec731cdc17f4046edaee7ad519f4c6bf2c3c1339ffd119b020f4a870788';
var passwordsJSON = {}
// ===================== VERAMO CONSTANTS =====================
const { ISelectiveDisclosure, SelectiveDisclosure, SdrMessageHandler } = require('@veramo/selective-disclosure')
const { KeyManager } = require('@veramo/key-manager')
const { createAgent } = require('@veramo/core')
const { createConnection } = require('typeorm')
const { KeyStore, PrivateKeyStore, DIDStore, migrations, Entities } = require('@veramo/data-store')
const { KeyManagementSystem, SecretBox } = require('@veramo/kms-local')
const { DIDManager } = require('@veramo/did-manager')
const { EthrDIDProvider } = require('@veramo/did-provider-ethr')
const { WebDIDProvider } = require('@veramo/did-provider-web')
const { CredentialIssuer } = require('@veramo/credential-w3c')
const DATABASE_FILE = 'database.sqlite'
const secretConfig = require('./config')
const INFURA_PROJECT_ID = secretConfig.INFURA_PROJECT_ID
const KMS_SECRET_KEY = secretConfig.KMS_SECRET_KEY
const dbConnection = createConnection({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities
})
const agent = createAgent({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY)))
      }
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr:ropsten',
      providers: {
        'did:ethr:ropsten': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'ropsten',
          rpcUrl: 'https://ropsten.infura.io/v3/' + INFURA_PROJECT_ID,
          gas: 500000
        }),
        'did:ethr:rinkeby': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
          gas: 500000
        }),
        'did:web': new WebDIDProvider({
          defaultKms: 'local'
        })
      }
    }),
    new CredentialIssuer(),
    new SelectiveDisclosure()
  ]
})
// ===================== EXPRESS APP CONFIGURATION =====================
app.use(cors({origin: 'http://localhost:3000'}))
app.use(bodyParser.urlencoded({ extended: true })) // needed to retrieve html form fields
app.use(bodyParser.json()) // github
app.use(cookieParser())
app.use(logger('dev'))
app.use(session({
  secret: 'example secret',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize()) // we load the passport auth middleware to our express application. It should be loaded before any route.
app.use(passport.session())
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
// ===================== PASSPORT FOR JWT AUTHENTICATION =====================
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
// Configure the local strategy for use by Passport.
// The local strategy requires a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the username and password are correct and then invoke `done` with a user
// object, which will be set at `req.user` in route handlers after authentication.
passport.use('local', new LocalStrategy(
  {
    usernameField: 'username', // it MUST match the name of the input field for the username in the login HTML formulary
    passwordField: 'password', // it MUST match the name of the input field for the password in the login HTML formulary
    session: false // we will store a JWT in the cookie with all the required session data. Our server does not need to keep a session, it's stateless
  },
  function (username, password, done) {
    validateUserPasswd(username, password).then(res => { // cridar una funció async
      if (res) {
        const user = {
          username: username,
          description: 'the only user that deserves to contact the fortune teller'
        }
        return done(null, user) // the first argument for done is the error, if any. In our case no error so that null. The object user will be added by the passport middleware to req.user and this will be available there for the next middleware and/or the route handler
      }
      return done(null, false) // in passport returning false as the user object means that the authentication process failed.
    })
  }
))
// ===================== JWT AUTHENTICATION FUNCTIONS =====================
// Get hashed passwords from database (passwords.json file)
fs.readFile('./passwords.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  passwordsJSON = JSON.parse(data)
})
function getHashedPasswd(_username) {
  var ret = null
  passwordsJSON.forEach(element => {
    if (element.username === _username) {
      ret = element.password
    }
  });
  return ret
}
function getSaltUser(_username) {
  const { salt } = passwordsJSON.find(pwd => pwd.username === _username); // find xq nomes necessito un element (salta el primer que retorna true). Si en necessités molt --> map
  return salt
}
async function validateUserPasswd(_username, _plainPasswd) {
  var hashedPasswd = getHashedPasswd(_username)
  
  
  // const recalculatedHash = await scryptPbkdf.scrypt('ILoveCelia', '5546724a2408844afaccd02a29608730', 32)
  // const recalculatedHash_hex = Buffer.from(recalculatedHash).toString('hex')
  // console.log(recalculatedHash_hex)




  if (hashedPasswd != null) {
    const salt = getSaltUser(_username)
    const derivedKeyLength = 32
    const recalculatedHash = await scryptPbkdf.scrypt(_plainPasswd, salt, derivedKeyLength)
    const recalculatedHash_hex = Buffer.from(recalculatedHash).toString('hex')
    // TO SAVE THE SALT AND THE HASH IN passwords.json
    // const salt2 = scryptPbkdf.salt()
    // console.log(`[salt]: ${Buffer.from(salt2).toString('hex')}`)
    if (recalculatedHash_hex !== '') {
      if (hashedPasswd == recalculatedHash_hex) {
        return true
      } else {
        return false
      }
    } else { return false }
  }
}
// ===================== ENDPOINTS =====================
app.post('/verifyJwt', jsonParser, (req, res) => {
  jsonwebtoken = req.body.jwt
  if (jsonwebtoken !== undefined) {
    try {
      jwt.verify(jsonwebtoken, jwtSecret)
      res.json(true)
    } catch (err) {
      res.json(false)
    }
  }
})
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', session: false }),
  (req, res) => { //
    //res.send(`Hello ${req.user.username}`)
    // The JWT for the fortune teller is created here. Then it is sent the user agent inside a cookie.
    // This is what ends up in the JWT:
    const jwtClaims = {
      sub: req.user.username,
      iss: 'localhost:3000',
      aud: 'localhost:3000',
      exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
      role: 'user' // just to show a private JWT field
    }
    // generate a signed json web token. By default the signing algorithm is HS256 (HMAC-SHA256), i.e. we will 'sign' with a symmetric secret
    const token = jwt.sign(jwtClaims, jwtSecret)
    res
      .status(200)
      .json({
        message: 'Logged in successfully!',
        jwt: token
      });
    // And let us log a link to the jwt.iot debugger, for easy checking/verifying:
    console.log(`Token sent. Debug at https://jwt.io/?value=${token}`)
    console.log(`Token secret (for verifying the signature): ${jwtSecret.toString('hex')}`)
  }
)
// app.get of /getVerifiableCredential is not needed because with "npm start" react activates all GETs automatically
app.post('/postVerifiableCredential', [jsonParser, authenticateJWT], (req, res) => {
  // res.send({data: vc});
  const did = req.body.did
  if (did !== undefined && did !== '') {
    // NEXT THREE LINES HAVE BEEN EXECUTED ONLY ONCE
    // agent.didManagerCreate({
    //   alias: 'trustedIssuer'
    // }) did:ethr:ropsten:0x03d8fc8ec731cdc17f4046edaee7ad519f4c6bf2c3c1339ffd119b020f4a870788
    // agent.didManagerFind().then(res => {
    //   console.log(res)
    // })
    agent.createVerifiableCredential({
      credential: {
        // l'issuer ha de ser el DID d'aquest agent (alias test, en aquest cas)
        issuer: { id: UNIVERSITY_DID },
        credentialSubject: {
          id: did,
          claims: {
            universityName: "Monsters University",
            student: true,
            expDate: new Date("2022-08-01")
          }
        }
      },
      proofFormat: 'jwt',
      save: false
    }).then(result => {
      res.status(200).json({ message: 'Verifiable credential created successfully!', data: result })
    }).catch(err => {
      console.log(err)
      res.status(500).json({ message: 'Verifiable credential could not be created.' })
    })
  } else {
    res.status(500).json({ message: 'Verifiable credential could not be created.' })
  }
});
app.get('/getSelectiveDisclosure', (req, res) => {
  //NEXT THREE LINES HAVE BEEN EXECUTED ONLY ONCE
  // agent.didManagerCreate({
  //   alias: 'MonstersUniversity'
  // }) did:ethr:ropsten:0x02635d6577ee15f364d598d3fae47155d8224cabe2dc24c64f199418c7a9aec2b9
  // agent.didManagerFind().then(res => {
  //   console.log(res)
  // })
  agent.createSelectiveDisclosureRequest({
    data: {
      issuer: 'did:ethr:ropsten:0x02635d6577ee15f364d598d3fae47155d8224cabe2dc24c64f199418c7a9aec2b9',
      claims: [
        {
          'claimType': 'student',
          'claimValue': 'true',
          'essential': true
        },
        {
          'claimType': 'universityName',
          'claimValue': 'Monsters University',
          'essential': true
        },
        {
          'claimType': 'expDate',
          'claimValue': new Date("2022-08-01"),
          'essential': true
        }
      ]
    }
  }).then(response => {
    res.status(200).json({ message: 'Selective Disclosure created successfully!', data: response })
  }).catch(err => {
    res.status(500).json({ message: 'Selective Disclosure could not be created.' })
  })
});
// ===================== Listen on provided port, on all network interfaces =====================
// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Express Server listening on port ${port}`)); //Line 6