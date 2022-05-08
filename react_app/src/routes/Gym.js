import React, { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default class Gym extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
    };
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
          autoComplete="off"
        >
          <Typography variant="h3">
              Welcome to Monsters University's gym webpage!
          </Typography>
        </Box>
      </div>
    );
  }
}
  