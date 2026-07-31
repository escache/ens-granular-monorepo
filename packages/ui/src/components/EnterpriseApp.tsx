import { useState, Suspense, lazy, useCallback, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAppContext } from '../contexts/AppContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { SearchBar } from './SearchBar';
import { NotificationBadge } from './NotificationBadge';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { EnterpriseConnectButton } from './EnterpriseConnectButton';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./Dashboard').then(m => ({ default: m.Dashboard })));
const DelegationManagement = lazy(() => import('./DelegationManagement').then(m => ({ default: m.DelegationManagement })));
const GranularPermissions = lazy(() => import('./GranularPermissions').then(m => ({ default: m.GranularPermissions })));
const SubdomainCreation = lazy(() => import('./SubdomainCreation').then(m => ({ default: m.SubdomainCreation })));
const ApprovalManagement = lazy(() => import('./ApprovalManagement').then(m => ({ default: m.ApprovalManagement })));
const BatchOperations = lazy(() => import('./BatchOperations').then(m => ({ default: m.BatchOperations })));
const AccessControlLists = lazy(() => import('./AccessControlLists').then(m => ({ default: m.AccessControlLists })));
const EmergencyControls = lazy(() => import('./EmergencyControls').then(m => ({ default: m.EmergencyControls })));
const DelegateListView = lazy(() => import('./DelegateListView').then(m => ({ default: m.DelegateListView })));
const ResolverManagement = lazy(() => import('./ResolverManagement').then(m => ({ default: m.ResolverManagement })));
const SecurityDashboard = lazy(() => import('./SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const FactoryOperations = lazy(() => import('./FactoryOperations').then(m => ({ default: m.FactoryOperations })));
const ExportImport = lazy(() => import('./ExportImport').then(m => ({ default: m.ExportImport })));
const AddressBook = lazy(() => import('./AddressBook').then(m => ({ default: m.AddressBook })));
const TransactionHistory = lazy(() => import('./TransactionHistory').then(m => ({ default: m.TransactionHistory })));
const Settings = lazy(() => import('./Settings').then(m => ({ default: m.Settings })));
const PermissionTreeView = lazy(() => import('./PermissionTreeView').then(m => ({ default: m.PermissionTreeView })));

type Tab = 'dashboard' | 'factory' | 'delegation' | 'granular' | 'tree' | 'subdomain' | 'approval' | 
         'batch' | 'acl' | 'emergency' | 'delegates' | 'resolver' | 'security' | 
         'export' | 'addressbook' | 'history' | 'settings';

export function EnterpriseApp() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { isConnected, address } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
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
    { id: 'dashboard' as Tab, label: 'Dashboard' },
    { id: 'factory' as Tab, label: 'Factory' },
    { id: 'delegation' as Tab, label: 'Delegation' },
    { id: 'granular' as Tab, label: 'Permissions' },
    { id: 'tree' as Tab, label: 'Tree' },
    { id: 'subdomain' as Tab, label: 'Subdomains' },
    { id: 'approval' as Tab, label: 'Approvals' },
    { id: 'batch' as Tab, label: 'Batch' },
    { id: 'acl' as Tab, label: 'Access' },
    { id: 'emergency' as Tab, label: 'Emergency' },
    { id: 'delegates' as Tab, label: 'Delegates' },
    { id: 'resolver' as Tab, label: 'Resolver' },
    { id: 'security' as Tab, label: 'Security' },
    { id: 'export' as Tab, label: 'Export' },
    { id: 'addressbook' as Tab, label: 'Contacts' },
    { id: 'history' as Tab, label: 'History' },
    { id: 'settings' as Tab, label: 'Settings' },
  ];

  const shortcuts = useMemo(() => [
    { key: 'd', description: 'Dashboard', action: () => setActiveTab('dashboard') },
    { key: 'f', description: 'Factory', action: () => setActiveTab('factory') },
    { key: '1', description: 'Delegation', action: () => setActiveTab('delegation') },
    { key: '2', description: 'Permissions', action: () => setActiveTab('granular') },
    { key: '3', description: 'Subdomains', action: () => setActiveTab('subdomain') },
    { key: 's', description: 'Settings', action: () => setActiveTab('settings') },
    { key: '?', description: 'Show shortcuts', action: () => setShowShortcuts(true) },
  ], []);

  useKeyboardShortcuts(shortcuts);

  const renderTabContent = useCallback(() => {
    if (!isConnected) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-secondary mb-md">Connect your wallet to continue</p>
            <EnterpriseConnectButton 
              isConnected={isConnected}
              address={address}
              connectors={connectors}
              connect={connect}
              disconnect={disconnect}
              isPending={isPending}
              error={error}
            />
          </div>
        </div>
      );
    }

    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-32">
        <div className="text-secondary">Loading...</div>
      </div>
    );

    return (
      <Suspense fallback={<LoadingFallback />}>
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
        {activeTab === 'delegation' && <DelegationManagement delegateAddress={selectedDelegate} />}
        {activeTab === 'granular' && <GranularPermissions delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'tree' && <PermissionTreeView />}
        {activeTab === 'subdomain' && <SubdomainCreation delegateAddress={selectedDelegate} />}
        {activeTab === 'approval' && <ApprovalManagement />}
        {activeTab === 'batch' && <BatchOperations delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'acl' && <AccessControlLists delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'emergency' && <EmergencyControls delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'delegates' && <DelegateListView delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'resolver' && <ResolverManagement resolverAddress={resolverAddress} />}
        {activeTab === 'security' && <SecurityDashboard delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'export' && <ExportImport delegateAddress={selectedGranularDelegate} />}
        {activeTab === 'addressbook' && <AddressBook />}
        {activeTab === 'history' && <TransactionHistory />}
        {activeTab === 'settings' && (
          <Settings onResolverAddressChange={setResolverAddress} />
        )}
      </Suspense>
    );
  }, [
    activeTab,
    isConnected,
    selectedDelegate,
    selectedGranularDelegate,
    resolverAddress,
    setSelectedDelegate,
    setSelectedGranularDelegate,
    setResolverAddress,
  ]);

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Compact header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-lg py-sm flex items-center justify-between">
          <div className="flex items-center gap-lg">
            <h1 className="text-lg font-semibold m-0">ENS Granular Control</h1>
            <SearchBar
              onSelect={(result) => {
                if (result.type === 'domain') {
                  addRecentDomain(result.value);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-md">
            <NotificationBadge />
            <button
              onClick={() => setShowShortcuts(true)}
              className="btn btn-sm"
              title="Keyboard shortcuts (?)">
              ?
            </button>
            <EnterpriseConnectButton 
              isConnected={isConnected}
              address={address}
              connectors={connectors}
              connect={connect}
              disconnect={disconnect}
              isPending={isPending}
              error={error}
            />
          </div>
        </div>
      </header>

      {/* Compact tab navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="tabs px-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-1 p-lg overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          {renderTabContent()}
        </div>
      </main>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <KeyboardShortcuts
          shortcuts={shortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  );
}
