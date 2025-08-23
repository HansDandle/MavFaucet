import React from "react";
import DiceGame from "./DiceGame";
import Faucet from "./Faucet";

export default function App() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px" }}>
      <Faucet />
      <hr style={{ margin: "40px 0" }} />
      <DiceGame />
    </div>
  );
}