import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // Make sure to import your App component
import "./globals.css"

import {store} from './state/store'
import { Provider } from 'react-redux'
import {InternetIdentityProvider} from "ic-use-internet-identity"

const identityProvider = `http://${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}.localhost:4943` || "https://ic0.app"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <InternetIdentityProvider   loginOptions={{
      identityProvider 
  }} >
        <App/>
      </InternetIdentityProvider>
    </Provider>
  </React.StrictMode>,
);

