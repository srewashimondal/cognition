import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import App from './App'
import './index.css'
import { AuthProvider } from "./auth/AuthProvider";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
  <React.StrictMode>
    <BrowserRouter>
      <Theme>
        <App />
      </Theme>
    </BrowserRouter>
  </React.StrictMode>
  </AuthProvider>
)