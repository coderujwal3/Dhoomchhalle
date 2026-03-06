import React from "react";
import TextCursor from "./components/common/TextCursor";
import Home from "./pages/Home";
import "./index.css";

function App() {
  return (
    <div>
      <TextCursor />
      <div>
        <Home />
      </div>
    </div>
  );
}

export default App;
