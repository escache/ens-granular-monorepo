import { useState, useEffect, useRef } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  priority?: number;
}

interface ResponsiveNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ResponsiveNavigation({ tabs, activeTab, onTabChange }: ResponsiveNavigationProps) {
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>(tabs);
  const [overflowTabs, setOverflowTabs] = useState<Tab[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Ensure active tab is always visible
  const ensureActiveTabVisible = (visible: Tab[], overflow: Tab[]) => {
    const activeInOverflow = overflow.find(t => t.id === activeTab);
    if (activeInOverflow && visible.length > 0) {
      // Swap the active tab with the last visible tab
      const lastVisibleIndex = visible.length - 1;
      const newVisible = [...visible];
      const newOverflow = [...overflow];
      
      const activeOverflowIndex = overflow.indexOf(activeInOverflow);
      newOverflow[activeOverflowIndex] = visible[lastVisibleIndex];
      newVisible[lastVisibleIndex] = activeInOverflow;
      
      return { visible: newVisible, overflow: newOverflow };
    }
    return { visible, overflow };
  };

  useEffect(() => {
    const calculateVisibleTabs = () => {
      if (!navRef.current) return;

      const navWidth = navRef.current.offsetWidth;
      const moreButtonWidth = 120; // Approximate width of "More" button
      const tabPadding = 16; // Extra padding between tabs
      const availableWidth = navWidth - moreButtonWidth;
      const visible: Tab[] = [];
      const overflow: Tab[] = [];
      let currentWidth = 0;

      // Create temporary elements to measure tab widths
      const measureDiv = document.createElement('div');
      measureDiv.style.position = 'absolute';
      measureDiv.style.visibility = 'hidden';
      measureDiv.style.height = 'auto';
      measureDiv.style.width = 'auto';
      measureDiv.style.whiteSpace = 'nowrap';
      measureDiv.className = 'py-3 px-3 font-medium text-sm flex items-center space-x-1';
      document.body.appendChild(measureDiv);

      for (const tab of tabs) {
        // Measure tab width
        measureDiv.innerHTML = `<span>${tab.icon}</span><span class="hidden lg:inline">${tab.label}</span>`;
        const tabWidth = measureDiv.offsetWidth + tabPadding;

        if (currentWidth + tabWidth <= availableWidth) {
          visible.push(tab);
          currentWidth += tabWidth;
        } else {
          overflow.push(tab);
        }
      }

      document.body.removeChild(measureDiv);

      // If all tabs fit, don't show the more button
      if (overflow.length === 0) {
        setVisibleTabs(tabs);
        setOverflowTabs([]);
      } else if (overflow.length === tabs.length) {
        // If no tabs fit, show at least the first few
        const minVisible = Math.min(3, tabs.length);
        setVisibleTabs(tabs.slice(0, minVisible));
        setOverflowTabs(tabs.slice(minVisible));
      } else {
        // Ensure active tab is visible
        const adjusted = ensureActiveTabVisible(visible, overflow);
        setVisibleTabs(adjusted.visible);
        setOverflowTabs(adjusted.overflow);
      }
    };

    calculateVisibleTabs();

    const resizeObserver = new ResizeObserver(calculateVisibleTabs);
    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [tabs, activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

  return (
    <nav ref={navRef} className="flex justify-between items-center relative" aria-label="Tabs">
      <div className="flex space-x-2 flex-1 min-w-0">
        {visibleTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 transition-colors
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {overflowTabs.length > 0 && (
        <div className="relative ml-2">
          <button
            ref={moreButtonRef}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`
              py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-1 transition-all
              ${
                overflowTabs.some(tab => tab.id === activeTab)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-expanded={showMoreMenu}
            aria-haspopup="true"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
            <span>More</span>
            <svg 
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
              <div className="py-1 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical">
                {overflowTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`
                      w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    role="menuitem"
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <svg className="ml-auto h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
