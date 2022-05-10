import { Link } from "react-router-dom";
import React, { Component } from 'react';
import Login from './routes/Login'
import './App.css';

export default class App extends Component {
  state = {
    data: null,
  };

  render() {
    return (
      // <div>
      //   <h1>Master Thesis Project - SSI Authentication</h1>
      //   <nav
      //     style={{
      //       borderBottom: "solid 1px",
      //       paddingBottom: "1rem",
      //     }}
      //   >
      //     <Link to="/login">Login to Monsters University's webpage</Link>
      //     <br></br>
      //   </nav>
      // </div>
      <Login />
    );
  }
}