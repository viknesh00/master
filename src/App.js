import React from 'react';
import './App.css';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from "./routes";
import { UserProvider } from "./UserContext";
import { ToastContainer, Zoom } from "react-toastify";


const AppRoutes = () => {
    const routing = useRoutes(routes);
    return routing;
};

function App() {
  return (
    <UserProvider>
    <React.Fragment>
      <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
        <ToastContainer transition={Zoom} />
    </React.Fragment>
    </UserProvider>

  );
}

export default App;
