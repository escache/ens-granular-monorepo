import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { AppProvider } from './contexts/AppContext';
import { EnterpriseApp } from './components/EnterpriseApp';
import './index.css';
import './styles/enterprise.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <EnterpriseApp />
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);



