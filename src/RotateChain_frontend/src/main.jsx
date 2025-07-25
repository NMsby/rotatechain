import React from 'react';
import ReactDOM from 'react-dom/client';
//the actual app I intened to use in my app
import App from './app_2'; // Make sure to import your App component
//Initial IcpApp test
import ICPApp  from "./icp_app"
//import MarketPlace  from "./icp/App"
//import BTCApp from "./bitcoin_app"
import "./globals.css"


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
);


/*const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}*/
