import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchResult {
  type: 'domain' | 'delegate' | 'project';
  value: string;
  label: string;
}

interface SearchBarProps {
  onSelect?: (result: SearchResult) => void;
}

export function SearchBar({ onSelect }: SearchBarProps = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery) {
      const mockResults: SearchResult[] = [];
      
      if (debouncedQuery.endsWith('.eth')) {
        mockResults.push({
          type: 'domain',
          value: debouncedQuery,
          label: `Domain: ${debouncedQuery}`,
        });
      }
      
      if (debouncedQuery.startsWith('0x')) {
        mockResults.push({
          type: 'delegate',
          value: debouncedQuery,
          label: `Address: ${debouncedQuery.slice(0, 10)}...`,
        });
      }
      
      setResults(mockResults);
      setIsOpen(mockResults.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    if (onSelect) onSelect(result);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative" style={{ width: '220px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="input w-full"
        style={{ paddingLeft: '28px' }}
      />
      <svg className="w-4 h-4 absolute left-2 top-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              {result.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
