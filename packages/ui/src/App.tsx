import { useState, lazy, Suspense } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from './components/ConnectButton';
import { Dashboard } from './components/Dashboard';
import { SearchBar } from './components/SearchBar';
import { NotificationBadge } from './components/NotificationBadge';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ResponsiveNavigation } from './components/ResponsiveNavigation';
import { useAppContext } from './contexts/AppContext';

// Lazy load components for better performance
const FactoryOperations = lazy(() => import('./components/FactoryOperations').then(m => ({ default: m.FactoryOperations })));
const DelegationManagement = lazy(() => import('./components/DelegationManagement').then(m => ({ default: m.DelegationManagement })));
const GranularPermissions = lazy(() => import('./components/GranularPermissions').then(m => ({ default: m.GranularPermissions })));
const SubdomainCreation = lazy(() => import('./components/SubdomainCreation').then(m => ({ default: m.SubdomainCreation })));
const ApprovalManagement = lazy(() => import('./components/ApprovalManagement').then(m => ({ default: m.ApprovalManagement })));
const AccessControlLists = lazy(() => import('./components/AccessControlLists').then(m => ({ default: m.AccessControlLists })));
const EmergencyControls = lazy(() => import('./components/EmergencyControls').then(m => ({ default: m.EmergencyControls })));
const DelegateListView = lazy(() => import('./components/DelegateListView').then(m => ({ default: m.DelegateListView })));
const ResolverManagement = lazy(() => import('./components/ResolverManagement').then(m => ({ default: m.ResolverManagement })));
const SecurityDashboard = lazy(() => import('./components/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const BatchOperations = lazy(() => import('./components/BatchOperations').then(m => ({ default: m.BatchOperations })));
const ExportImport = lazy(() => import('./components/ExportImport').then(m => ({ default: m.ExportImport })));
const AddressBook = lazy(() => import('./components/AddressBook').then(m => ({ default: m.AddressBook })));
const TransactionHistory = lazy(() => import('./components/TransactionHistory').then(m => ({ default: m.TransactionHistory })));

type Tab = 'dashboard' | 'factory' | 'delegation' | 'granular' | 'subdomain' | 'approval' | 'acl' | 'emergency' | 'delegates' | 'resolver' | 'security' | 'settings' | 'batch' | 'export' | 'addressbook' | 'history';

function App() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const {
    selectedDelegate,
    selectedGranularDelegate,
    resolverAddress,
    setSelectedDelegate,
    setSelectedGranularDelegate,
    setResolverAddress,
    addRecentDomain,
  } = useAppContext();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'factory', label: 'Factory', icon: '🏭' },
    { id: 'delegation', label: 'Delegation', icon: '🎯' },
    { id: 'granular', label: 'Permissions', icon: '🔐' },
    { id: 'subdomain', label: 'Subdomains', icon: '🌐' },
    { id: 'approval', label: 'Approvals', icon: '✅' },
    { id: 'batch', label: 'Batch', icon: '📦' },
    { id: 'acl', label: 'Access Control', icon: '🛡️' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'delegates', label: 'Delegates', icon: '👥' },
    { id: 'resolver', label: 'Resolver', icon: '🔄' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'export', label: 'Export/Import', icon: '💾' },
    { id: 'addressbook', label: 'Contacts', icon: '📖' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ENS Granular Delegation Manager</h1>
                <p className="text-sm text-gray-500 mt-1">Manage ENS domains with granular permissions</p>
              </div>
              <SearchBar 
                onSelect={(result) => {
                  if (result.type === 'domain') {
                    addRecentDomain(result.value);
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBadge />
              <ConnectButton
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

      {isConnected ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6">
              <ResponsiveNavigation 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={(tabId) => setActiveTab(tabId as Tab)} 
              />
            </div>

            <div className="p-6">
              <Suspense fallback={<LoadingSkeleton lines={5} />}>
                {(activeTab === 'delegation' || activeTab === 'granular' || activeTab === 'subdomain' || 
                  activeTab === 'acl' || activeTab === 'emergency' || activeTab === 'delegates' || 
                  activeTab === 'security' || activeTab === 'batch') && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      {(activeTab === 'delegation' || activeTab === 'subdomain') && (
                        <>Using delegate: <span className="font-mono">{selectedDelegate || 'None selected'}</span></>
                      )}
                      {(activeTab === 'granular' || activeTab === 'acl' || activeTab === 'emergency' || 
                        activeTab === 'delegates' || activeTab === 'security' || activeTab === 'batch') && (
                        <>Using granular delegate: <span className="font-mono">{selectedGranularDelegate || 'None selected'}</span></>
                      )}
                      {' '}
                      {((activeTab === 'delegation' || activeTab === 'subdomain') && !selectedDelegate) ||
                       ((activeTab === 'granular' || activeTab === 'acl' || activeTab === 'emergency' || 
                         activeTab === 'delegates' || activeTab === 'security' || activeTab === 'batch') && !selectedGranularDelegate) ? (
                        <span className="text-blue-600">Go to Factory tab to select a delegate</span>
                      ) : null}
                    </p>
                  </div>
                )}
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
              {activeTab === 'settings' && (
                <Settings onResolverAddressChange={setResolverAddress} />
              )}
              {activeTab === 'batch' && (
                <BatchOperations delegateAddress={selectedGranularDelegate} />
              )}
              {activeTab === 'export' && (
                <ExportImport delegateAddress={selectedGranularDelegate} />
              )}
              {activeTab === 'addressbook' && (
                <AddressBook />
              )}
              {activeTab === 'history' && (
                <TransactionHistory />
              )}
              </Suspense>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Please connect your wallet to manage ENS domains
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

