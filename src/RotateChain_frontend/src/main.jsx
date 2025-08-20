import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app_2'; // Make sure to import your App component
import "./globals.css"

import {store} from './state/store'
import { Provider } from 'react-redux'
import {InternetIdentityProvider} from "ic-use-internet-identity"


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <InternetIdentityProvider   loginOptions={{
    identityProvider: `http://${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
  }} >
        <App/>
      </InternetIdentityProvider>
    </Provider>
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
