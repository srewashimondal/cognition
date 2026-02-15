import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import App from './App'
import './index.css'
import { AuthProvider } from "./context/AuthProvider";
import { WorkspaceProvider } from './context/WorkspaceProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <WorkspaceProvider>
      {/*<React.StrictMode>*/}
        <BrowserRouter>
          <Theme>
            <App />
          </Theme>
        </BrowserRouter>
      {/*</React.StrictMode>*/}
    </WorkspaceProvider>
  </AuthProvider>
)