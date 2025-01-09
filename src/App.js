import React from 'react';
import './App.css';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from "./routes";

const AppRoutes = () => {
    const routing = useRoutes(routes);
    return routing;
};

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
