import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./auth/msalConfig";
import AIQueryService from './services/AIQueryService.js';

// Eagerly connect the AI websocket so `sendProcessQuery` uses it
try {
  AIQueryService.connectWebsocket();
} catch (e) {
  // ignore connect errors here; sendProcessQuery will fallback to HTTP
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

createRoot(rootElement).render(
	<StrictMode>
		<MsalProvider instance={msalInstance}>
			<App />
		</MsalProvider>
	</StrictMode>,
);


 