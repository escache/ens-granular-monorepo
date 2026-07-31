import { lazy, Suspense, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAppContext } from '../contexts/AppContext';
import { ModernConnectButton } from './ModernConnectButton';
import { LoadingSkeleton } from './LoadingSkeleton';
import { NotificationBadge } from './NotificationBadge';
import { SearchBar } from './SearchBar';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { GasEstimation } from './GasEstimation';
// Theme styles are now inline

// Lazy load components
const Dashboard = lazy(() => import('./Dashboard').then(m => ({ default: m.Dashboard })));
const FactoryOperations = lazy(() => import('./FactoryOperations').then(m => ({ default: m.FactoryOperations })));
const DelegationManagement = lazy(() => import('./DelegationManagement').then(m => ({ default: m.DelegationManagement })));
const GranularPermissions = lazy(() => import('./GranularPermissions').then(m => ({ default: m.GranularPermissions })));
const SubdomainCreation = lazy(() => import('./SubdomainCreation').then(m => ({ default: m.SubdomainCreation })));
const ApprovalManagement = lazy(() => import('./ApprovalManagement').then(m => ({ default: m.ApprovalManagement })));
const AccessControlLists = lazy(() => import('./AccessControlLists').then(m => ({ default: m.AccessControlLists })));
const EmergencyControls = lazy(() => import('./EmergencyControls').then(m => ({ default: m.EmergencyControls })));
const DelegateListView = lazy(() => import('./DelegateListView').then(m => ({ default: m.DelegateListView })));
const ResolverManagement = lazy(() => import('./ResolverManagement').then(m => ({ default: m.ResolverManagement })));
const SecurityDashboard = lazy(() => import('./SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const Settings = lazy(() => import('./Settings').then(m => ({ default: m.Settings })));
const BatchOperations = lazy(() => import('./BatchOperations').then(m => ({ default: m.BatchOperations })));
const AddressBook = lazy(() => import('./AddressBook').then(m => ({ default: m.AddressBook })));
const TransactionHistory = lazy(() => import('./TransactionHistory').then(m => ({ default: m.TransactionHistory })));
const ExportImport = lazy(() => import('./ExportImport').then(m => ({ default: m.ExportImport })));

type Tab = 
  | 'dashboard' 
  | 'factory' 
  | 'delegation' 
  | 'granular' 
  | 'subdomain' 
  | 'approval'
  | 'batch'
  | 'acl'
  | 'emergency'
  | 'delegates'
  | 'resolver'
  | 'security'
  | 'addressbook'
  | 'history'
  | 'export'
  | 'settings';

interface TabConfig {
  id: Tab;
  label: string;
  description?: string;
  badge?: number;
}

export function ModernApp() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  const {
    selectedDelegate,
    selectedGranularDelegate,
    resolverAddress,
    setSelectedDelegate,
    setSelectedGranularDelegate,
    setResolverAddress,
    theme,
    toggleTheme,
  } = useAppContext();

  const tabs: TabConfig[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'System overview and analytics' },
    { id: 'factory', label: 'Factory', description: 'Deploy new contracts' },
    { id: 'delegation', label: 'Delegation', description: 'Manage delegations' },
    { id: 'granular', label: 'Permissions', description: 'Fine-grained control' },
    { id: 'subdomain', label: 'Subdomains', description: 'Create and manage' },
    { id: 'approval', label: 'Approvals', description: 'Pending approvals' },
    { id: 'batch', label: 'Batch Operations', description: 'Bulk actions' },
    { id: 'acl', label: 'Access Control', description: 'Whitelist/blacklist' },
    { id: 'emergency', label: 'Emergency', description: 'Emergency controls' },
    { id: 'delegates', label: 'Delegates', description: 'View all delegates' },
    { id: 'resolver', label: 'Resolver', description: 'Resolver settings' },
    { id: 'security', label: 'Security', description: 'Security dashboard' },
    { id: 'addressbook', label: 'Contacts', description: 'Address book' },
    { id: 'history', label: 'History', description: 'Transaction logs' },
    { id: 'export', label: 'Export/Import', description: 'Data management' },
    { id: 'settings', label: 'Settings', description: 'Configuration' },
  ];

  const shortcuts = [
    { key: 'd', ctrl: true, handler: () => setActiveTab('dashboard'), description: 'Navigate to Dashboard' },
    { key: 'f', ctrl: true, handler: () => setActiveTab('factory'), description: 'Navigate to Factory' },
    { key: 'p', ctrl: true, handler: () => setActiveTab('granular'), description: 'Navigate to Permissions' },
    { key: 's', ctrl: true, handler: () => setActiveTab('settings'), description: 'Navigate to Settings' },
    { key: 't', ctrl: true, handler: toggleTheme, description: 'Toggle Theme' },
    { key: '/', ctrl: true, handler: () => setShowKeyboardHelp(true), description: 'Show Keyboard Shortcuts' },
  ];

  useKeyboardShortcuts(shortcuts);

  const handleSearch = (result: any) => {
    if (result.type === 'domain') {
      setActiveTab('delegation');
    } else if (result.type === 'delegate') {
      setActiveTab('delegates');
    } else if (result.type === 'project') {
      setActiveTab('factory');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Modern Gradient Background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(at 40% 20%, rgb(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgb(20, 184, 166, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgb(99, 102, 241, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgb(20, 184, 166, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgb(99, 102, 241, 0.05) 0px, transparent 50%)
          `
        }}
      />
      
      {/* Main Container */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200/20 bg-white/70 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    ENS Delegation Manager
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Advanced Permission Control System
                  </p>
                </div>
              </div>

              {/* Search, Notifications, and Connect */}
              <div className="flex items-center space-x-4">
                <SearchBar onSelect={handleSearch} />
                <NotificationBadge />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <ModernConnectButton
                  isConnected={isConnected}
                  address={address}
                  connectors={connectors}
                  connect={connect}
                  disconnect={disconnect}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 transition-all hover:shadow-xl">
            <nav className="flex gap-2 overflow-x-auto p-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-block px-4 py-2 text-sm font-medium transition-all rounded-lg
                    ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                  title={tab.description}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Status Bar */}
          {isConnected && (activeTab === 'delegation' || activeTab === 'granular' || activeTab === 'subdomain' || 
            activeTab === 'acl' || activeTab === 'emergency' || activeTab === 'delegates' || 
            activeTab === 'security') && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6 flex items-center justify-between transition-all hover:shadow-xl">
              <div className="flex items-center space-x-6">
                {(activeTab === 'delegation' || activeTab === 'subdomain') && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    <span className="font-medium">Delegate:</span>
                    <code className="font-mono text-xs">{selectedDelegate || 'Not selected'}</code>
                  </div>
                )}
                {(activeTab === 'granular' || activeTab === 'acl' || activeTab === 'emergency' || 
                  activeTab === 'delegates' || activeTab === 'security') && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    <span className="font-medium">Granular Delegate:</span>
                    <code className="font-mono text-xs">{selectedGranularDelegate || 'Not selected'}</code>
                  </div>
                )}
              </div>
              <GasEstimation />
            </div>
          )}

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 min-h-[600px] transition-all hover:shadow-xl">
            <Suspense fallback={
              <div className="p-8">
                <LoadingSkeleton lines={5} />
              </div>
            }>
              {!isConnected && activeTab !== 'dashboard' ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center shadow-xl">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Please connect your wallet to access this feature
                    </p>
                    <button
                      onClick={() => connect({ connector: connectors[0] })}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {activeTab === 'dashboard' && <Dashboard />}
                  {activeTab === 'factory' && (
                    <FactoryOperations 
                      onDelegateSelect={setSelectedDelegate}
                      onGranularDelegateSelect={setSelectedGranularDelegate}
                    />
                  )}
                  {activeTab === 'delegation' && (
                    <DelegationManagement delegateAddress={selectedDelegate} />
                  )}
                  {activeTab === 'granular' && (
                    <GranularPermissions delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'subdomain' && (
                    <SubdomainCreation delegateAddress={selectedDelegate} />
                  )}
                  {activeTab === 'approval' && <ApprovalManagement />}
                  {activeTab === 'batch' && (
                    <BatchOperations delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'acl' && (
                    <AccessControlLists delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'emergency' && (
                    <EmergencyControls delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'delegates' && (
                    <DelegateListView delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'resolver' && (
                    <ResolverManagement resolverAddress={resolverAddress} />
                  )}
                  {activeTab === 'security' && (
                    <SecurityDashboard delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'addressbook' && <AddressBook />}
                  {activeTab === 'history' && <TransactionHistory />}
                  {activeTab === 'export' && (
                    <ExportImport delegateAddress={selectedGranularDelegate} />
                  )}
                  {activeTab === 'settings' && (
                    <Settings onResolverAddressChange={setResolverAddress} />
                  )}
                </div>
              )}
            </Suspense>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        {showKeyboardHelp && (
          <KeyboardShortcuts 
            shortcuts={shortcuts}
            onClose={() => setShowKeyboardHelp(false)}
          />
        )}

        {/* Floating Action Button */}
        <button
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all cursor-pointer"
          onClick={() => setShowKeyboardHelp(true)}
          aria-label="Keyboard shortcuts"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
