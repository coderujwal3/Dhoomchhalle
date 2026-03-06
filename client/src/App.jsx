import React from "react";
import TextCursor from "./components/common/TextCursor";
import Home from "./pages/Home";
import "./index.css";
import SmoothScroll from "./components/common/SmoothScroll";

function App() {
  return (
    <SmoothScroll>
      <TextCursor />
      <div>
        <Home />
      </div>
    </SmoothScroll>
  );
}

export default App;
