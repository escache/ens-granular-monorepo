import { useState } from 'react';
import { validateAddress, formatAddress } from '../utils/validation';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showValidation?: boolean;
}

export function AddressInput({ 
  value, 
  onChange, 
  label = 'Address',
  placeholder = '0x...',
  required = false,
  showValidation = true,
}: AddressInputProps) {
  const [touched, setTouched] = useState(false);
  const validation = validateAddress(value);
  const showError = showValidation && touched && !validation.valid;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!touched) setTouched(true);
        }}
        onBlur={() => setTouched(true)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
          showError ? 'border-red-300' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        required={required}
      />
      {showError && (
        <p className="mt-1 text-xs text-red-600">{validation.error}</p>
      )}
      {!showError && value && validation.valid && (
        <p className="mt-1 text-xs text-gray-500">
          {formatAddress(value)}
        </p>
      )}
    </div>
  );
}

