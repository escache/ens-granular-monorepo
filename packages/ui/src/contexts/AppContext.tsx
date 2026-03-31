import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useChainId } from 'wagmi';

interface AppContextType {
  selectedDelegate: string;
  selectedGranularDelegate: string;
  resolverAddress: string;
  recentDomains: string[];
  favoriteProjects: string[];
  theme: 'light' | 'dark';
  setSelectedDelegate: (address: string) => void;
  setSelectedGranularDelegate: (address: string) => void;
  setResolverAddress: (address: string) => void;
  addRecentDomain: (domain: string) => void;
  toggleFavoriteProject: (project: string) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const chainId = useChainId();
  const [selectedDelegate, setSelectedDelegate] = useState('');
  const [selectedGranularDelegate, setSelectedGranularDelegate] = useState('');
  const [resolverAddress, setResolverAddress] = useState('');
  const [recentDomains, setRecentDomains] = useState<string[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('appContext');
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedDelegate(data.selectedDelegate || '');
      setSelectedGranularDelegate(data.selectedGranularDelegate || '');
      setResolverAddress(data.resolverAddress || '');
      setRecentDomains(data.recentDomains || []);
      setFavoriteProjects(data.favoriteProjects || []);
      setTheme(data.theme || 'light');
    }
  }, []);

  useEffect(() => {
    const data = {
      selectedDelegate,
      selectedGranularDelegate,
      resolverAddress,
      recentDomains,
      favoriteProjects,
      theme,
    };
    localStorage.setItem('appContext', JSON.stringify(data));
  }, [selectedDelegate, selectedGranularDelegate, resolverAddress, recentDomains, favoriteProjects, theme]);

  const addRecentDomain = (domain: string) => {
    setRecentDomains(prev => {
      const filtered = prev.filter(d => d !== domain);
      return [domain, ...filtered].slice(0, 10);
    });
  };

  const toggleFavoriteProject = (project: string) => {
    setFavoriteProjects(prev => {
      if (prev.includes(project)) {
        return prev.filter(p => p !== project);
      }
      return [...prev, project];
    });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{
      selectedDelegate,
      selectedGranularDelegate,
      resolverAddress,
      recentDomains,
      favoriteProjects,
      theme,
      setSelectedDelegate,
      setSelectedGranularDelegate,
      setResolverAddress,
      addRecentDomain,
      toggleFavoriteProject,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
