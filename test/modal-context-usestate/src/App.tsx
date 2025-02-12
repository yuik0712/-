import React from "react";
import { ModalProvider } from "./ModalContext"; // Context Provider 추가
import Home from "./Home";

const App = () => {
  return (
    <ModalProvider>
      <Home />
    </ModalProvider>
  );
};

export default App;