import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/appearance.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ChatProvider from './Context/ChatProvider';
import { AppearanceProvider } from './Context/AppearanceProvider';
import { applyAppearance, loadStoredAppearance } from './config/appearance';

const storedAppearance = loadStoredAppearance();
applyAppearance(storedAppearance.themeId, storedAppearance.fontId);

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, sans-serif',
});

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim() || '';

const app = (
  <BrowserRouter>
    <AppearanceProvider>
      <ChatProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <ModalsProvider>
            <Notifications position="top-right" />
            <App />
          </ModalsProvider>
        </MantineProvider>
      </ChatProvider>
    </AppearanceProvider>
  </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  googleClientId
    ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    : app
);

reportWebVitals();
