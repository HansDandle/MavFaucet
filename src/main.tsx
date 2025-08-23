import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
import React from "react";
import ReactDOM from "react-dom/client";
//import Faucet from "./Faucet";
import DiceGame from "./DiceGame";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px" }}>
      <Faucet />
      <hr style={{ margin: "40px 0" }} />
      <DiceGame />
    </div>
  </React.StrictMode>
);
