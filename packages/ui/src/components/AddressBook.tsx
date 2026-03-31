import { useState, useEffect } from 'react';
import { AddressInput } from './AddressInput';
import { reverseResolve } from '../utils/ens';
import { formatAddress } from '../utils/validation';

interface AddressEntry {
  address: string;
  name: string;
  ensName?: string;
  addedAt: number;
}

export function AddressBook() {
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('addressBook');
    if (saved) {
      setAddresses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('addressBook', JSON.stringify(addresses));
  }, [addresses]);

  const handleAdd = async () => {
    if (!newAddress || !newName) return;

    const ensName = await reverseResolve(newAddress as `0x${string}`);
    
    const entry: AddressEntry = {
      address: newAddress,
      name: newName,
      ensName: ensName || undefined,
      addedAt: Date.now(),
    };

    setAddresses([...addresses, entry]);
    setNewAddress('');
    setNewName('');
  };

  const handleRemove = (address: string) => {
    setAddresses(addresses.filter(a => a.address !== address));
  };

  const handleSelect = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Book</h2>
        <p className="text-sm text-gray-600 mb-6">
          Save frequently used addresses for quick access
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Wallet"
            />
          </div>
          <AddressInput
            value={newAddress}
            onChange={setNewAddress}
            label="Address"
          />
          <button
            onClick={handleAdd}
            disabled={!newAddress || !newName}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Address Book
          </button>
        </div>
      </div>

      {addresses.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Addresses</h3>
          <div className="space-y-2">
            {addresses.map((entry) => (
              <div
                key={entry.address}
                className="p-4 bg-white rounded-md border border-gray-200 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{entry.name}</div>
                  <div className="text-sm text-gray-600 font-mono">
                    {formatAddress(entry.address)}
                  </div>
                  {entry.ensName && (
                    <div className="text-xs text-blue-600 mt-1">{entry.ensName}</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSelect(entry.address)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    title="Copy address"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleRemove(entry.address)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {addresses.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-500">
          No saved addresses yet. Add one above to get started.
        </div>
      )}
    </div>
  );
}

