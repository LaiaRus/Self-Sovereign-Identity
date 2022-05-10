import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

export default function SignIn() {
  const [wrongPass, setWrongPass] = React.useState(false);
  const [helperText, setHelperText] = React.useState("");
  React.useEffect(() => {
    const jwt = localStorage.getItem('jwt')
    if (jwt) {
      verifyJWT(jwt).then(res => {
        if (res) {
          window.history.pushState({}, undefined, "/mu");
          window.location.reload();
        } else {
          localStorage.removeItem('jwt')
        }
      })
    }
  }, []);

  async function verifyJWT(jwt) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jwt: jwt })
    };
    const response = await fetch(process.env.REACT_APP_BACKEND_MU_URL + '/verifyJwt', requestOptions);
    const body = await response.json();
    return body
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.get('username'),
        password: data.get('password')
      })
    };
    fetch(process.env.REACT_APP_BACKEND_MU_URL + '/login', requestOptions)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((body) => {
        localStorage.setItem('jwt', body.jwt)
        window.history.pushState({}, undefined, "/mu");
        window.location.reload();
      })
      .catch((error) => {
        setHelperText("Incorrect username or password")
        setWrongPass(true)
      });
  };

  function textFieldOnChange(event) {
    setHelperText("")
    setWrongPass(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              error={wrongPass}
              onChange={textFieldOnChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              helperText={helperText}
              error={wrongPass}
              onChange={textFieldOnChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}