import React, { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import { agent } from '../veramo/setup.ts';

var STUDENT_DID = ''
const UNIVERSITY_DID = 'did:ethr:ropsten:0x03d8fc8ec731cdc17f4046edaee7ad519f4c6bf2c3c1339ffd119b020f4a870788';

export default class Mu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alertOpen: false,
      alertSeverity: 'success',
      alertMessage: '',
    };
  }

  handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ alertOpen: false });
  };

  action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={this.handleAlertClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  handleClick_vc = async () => {
    const did = await agent.didManagerGetOrCreate({
      alias: 'student'
    })
    STUDENT_DID = did
    const vc = await this.createVerifiableCredential(did)
    console.log('Created verifiable credential')
    var vc_string = ''
    if (vc !== null && await this.verifyVerifiableCredential(vc, did)) {
      vc_string = JSON.stringify(vc)
      localStorage.setItem('verifiableCredential', vc_string)
      this.setState({ alertSeverity: 'success' });
      this.setState({ alertMessage: 'A verifiable credential has been created successfully.' })
      this.setState({ alertOpen: true });
    }
  }

  // Alert that student needs to get an anonymous credential first
  alertLackOfCredential() {
    this.setState({ alertSeverity: 'error' });
    this.setState({ alertMessage: 'An anonymous credential is needed to access Monsters Gym webpage.' })
    this.setState({ alertOpen: true });
  }

  handleClick_gym = async () => {
    if (localStorage.getItem('verifiableCredential') === null) {
      this.alertLackOfCredential()
    }
    else {
      var vc = localStorage.getItem('verifiableCredential')
      vc = JSON.parse(vc)
      if (STUDENT_DID !== '' && vc !== null && this.verifyVerifiableCredential(vc, STUDENT_DID)) {
        const vp = await this.createVerifiablePresentation(vc)
        console.log('Created verifiable presentation')
        if (await this.verifyVerifiablePresentation(vp, STUDENT_DID)) {
          window.history.pushState({}, undefined, "/gym");
          window.location.reload();
        }
      }
      else {
        this.alertLackOfCredential()
      }
    }
  }

  handleClick_logout() {
    localStorage.removeItem('verifiableCredential');
    localStorage.removeItem('jwt');
    window.history.pushState({}, undefined, "/");
    window.location.reload();
  }

  createVerifiableCredential = async (did) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('jwt'), },
      body: JSON.stringify({ did: did })
    };
    const response = await fetch(process.env.REACT_APP_BACKEND_MU_URL + '/postVerifiableCredential', requestOptions);
    const body = await response.json();
    if (body.data !== undefined) {
      const json = body.data;
      return json
    }
    return null
  }

  verifyVerifiableCredential (vc, studentDid) {
    const subjectVc = vc.credentialSubject.id.did
    const universityDid = vc.issuer.id
    const studentClaim = vc.credentialSubject.claims.student
    const expDate = vc.credentialSubject.claims.expDate
    if (subjectVc === studentDid.did && universityDid === UNIVERSITY_DID && studentClaim && new Date(expDate) > new Date()) {
      console.log('Verified credential')
      return true;
    }
    else {
      console.log('Wrong credential')
      return false;
    }
  }

  getSelectiveDisclosure = async () => {
    const response = await fetch('/getSelectiveDisclosure');
    const body = await response.json();
    if (body !== undefined) {
      return body;
    }
    return null;
  }

  createVerifiablePresentation = async (vc) => {
    const sdr = await this.getSelectiveDisclosure();
    const vp = await agent.createVerifiablePresentation({
      // añadir el DID del client
      presentation: {
        holder: vc.credentialSubject.id.did,
        request: sdr,
        verifiableCredential: [vc]
      },// això falla. hauria de mostrar el VC
      proofFormat: 'jwt',
      save: false
    })
    if (vp !== undefined) {
      return vp
    }
    return null
  }

  verifyVerifiablePresentation = async (vp, studentDid) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('jwt'), },
      body: JSON.stringify({
        vp: vp,
        did: studentDid
      })
    };
    const response = await fetch(process.env.REACT_APP_BACKEND_GYM_URL + '/postVerifyVerifiablePresentation', requestOptions);
    const body = await response.json();
    if (body) {
      console.log('Verified presentation')
      return true;
    }
    console.log('Wrong presentation')
    return false;
  }

  render() {
    return (
      <div>
        <Box
          component="form"
          sx={{
            width: '95%',
            padding: '2%'
          }}
          noValidate
          autoComplete="off">
          <Typography variant="h1">
            Monsters University
          </Typography>
          <Button sx={{ marginTop: '2%' }} variant="contained" onClick={this.handleClick_vc}>Get anonymous student credential</Button>
          <br></br>
          <Button sx={{ marginTop: '2%' }} variant="contained" onClick={this.handleClick_gym}>Go to Monsters Gym webpage</Button>
          <br></br>
          <Button color="error" sx={{ marginTop: '2%' }} variant="contained" onClick={this.handleClick_logout}>Logout</Button>
          <Snackbar
            open={this.state.alertOpen}
            autoHideDuration={6000}
            onClose={this.handleAlertClose}
            action={this.action}
          >
            <Alert onClose={this.handleAlertClose} severity={this.state.alertSeverity} sx={{ width: '100%' }}>
              {this.state.alertMessage}
            </Alert>
          </Snackbar>
        </Box>
      </div>
    );
  }
}