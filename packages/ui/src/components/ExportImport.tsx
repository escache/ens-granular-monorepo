import { useState } from 'react';
import { namehash } from 'viem/ens';
import { PERMISSIONS, PERMISSION_NAMES } from '../config/contracts';

interface DelegationConfig {
  domain: string;
  delegates: {
    address: string;
    permissions: string[];
    expiresAt: number | null;
    enabled: boolean;
    locked: boolean;
  }[];
}

interface ExportImportProps {
  delegateAddress?: string;
}

export function ExportImport({ delegateAddress }: ExportImportProps) {
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');

  const handleExport = () => {
    const config: DelegationConfig = {
      domain: '',
      delegates: [],
    };

    const exported = JSON.stringify(config, null, 2);
    setExportData(exported);

    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ens-delegation-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const config: DelegationConfig = JSON.parse(importData);
      
      if (!config.domain || !Array.isArray(config.delegates)) {
        throw new Error('Invalid configuration format');
      }

      alert(`Import successful! Found ${config.delegates.length} delegates for ${config.domain}`);
      setImportData('');
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export / Import</h2>
        <p className="text-sm text-gray-600 mb-6">
          Export delegation configurations to JSON or import from a file
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Export your delegation configuration to a JSON file for backup or sharing.
          </p>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export to JSON
          </button>
          {exportData && (
            <div className="mt-4 p-3 bg-white rounded border border-gray-200">
              <pre className="text-xs overflow-auto max-h-48">{exportData}</pre>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import a delegation configuration from a JSON file.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste JSON
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                rows={8}
                placeholder='{"domain": "example.eth", "delegates": [...]}'
              />
            </div>
            <button
              onClick={handleImport}
              disabled={!importData}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Import Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Configuration Format</h4>
        <pre className="text-xs text-blue-800 overflow-auto">
{JSON.stringify({
  domain: "example.eth",
  delegates: [
    {
      address: "0x...",
      permissions: ["SET_ADDR_RECORD", "SET_TEXT_RECORD"],
      expiresAt: 1234567890,
      enabled: true,
      locked: false
    }
  ]
}, null, 2)}
        </pre>
      </div>
    </div>
  );
}

