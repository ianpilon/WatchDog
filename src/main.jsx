import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: window.location.origin,
  ui_host: 'https://app.posthog.com',
};

const enablePostHog = !import.meta.env.DEV && Boolean(import.meta.env.VITE_PUBLIC_POSTHOG_KEY);

const Root = (
  <React.StrictMode>
    {enablePostHog ? (
      <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
        <App />
      </PostHogProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')).render(Root);