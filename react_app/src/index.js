import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mu from "./routes/Mu"
import Login from "./routes/Login"
import Gym from "./routes/Gym"
import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="mu" element={<Mu />} />
      <Route path="gym" element={<Gym />} />
    </Routes>
  </BrowserRouter>,
  rootElement
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
