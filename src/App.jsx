import { RouterProvider } from "react-router-dom";
import router from "./router";
import { requestForToken } from "../config/firebase";
import React, { useEffect, useState } from "react";

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
    
  );
}

export default App;

