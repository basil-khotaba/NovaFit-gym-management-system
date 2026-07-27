import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

/**
 * Entry point — mounts the app and wires up the global providers.
 *
 * Provider order matters here: Redux (store) and routing (BrowserRouter)
 * wrap AuthProvider so auth logic can use routing/dispatch if it ever
 * needs to; App is innermost since it consumes all of the above.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);