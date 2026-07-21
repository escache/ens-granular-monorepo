import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { namehash } from 'viem/ens';
import { PERMISSIONS, PERMISSION_NAMES } from '../config/contracts';
import granularABI from '../abis/GranularABI.json';
import { useAppContext } from '../contexts/AppContext';

interface PermissionNode {
  id: string;
  name: string;
  value?: bigint;
  description?: string;
  children?: PermissionNode[];
  enabled?: boolean;
}

interface TreeNodeProps {
  node: PermissionNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  activePermissions: bigint;
}

function TreeNode({ node, depth, expanded, onToggle, activePermissions }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isEnabled = node.value ? (activePermissions & node.value) === node.value : false;
  
  // Calculate if category has any enabled permissions
  const categoryStatus = useMemo(() => {
    if (!hasChildren) return null;
    const enabledCount = node.children!.filter(child => 
      child.value ? (activePermissions & child.value) === child.value : false
    ).length;
    return { enabled: enabledCount, total: node.children!.length };
  }, [hasChildren, node.children, activePermissions]);

  return (
    <div className="permission-tree-node">
      <div 
        className={`tree-row ${hasChildren ? 'has-children' : ''} ${isEnabled ? 'enabled' : ''}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {/* Expand/Collapse indicator */}
        <span className="tree-toggle">
          {hasChildren ? (isExpanded ? '[-]' : '[+]') : ' * '}
        </span>
        
        {/* Permission status indicator */}
        {!hasChildren && (
          <span className={`status-indicator ${isEnabled ? 'active' : 'inactive'}`}>
            {isEnabled ? '[ON]' : '[--]'}
          </span>
        )}
        
        {/* Category status */}
        {hasChildren && categoryStatus ? (
          <span className="category-status">
            [{categoryStatus.enabled}/{categoryStatus.total}]
          </span>
        ) : null}
        
        {/* Node name */}
        <span className={`node-name ${hasChildren ? 'category' : ''}`}>
          {node.name}
        </span>
        
        {/* Permission value (hex) */}
        {node.value != null && node.value > 0n ? (
          <span className="permission-value">
            (0x{node.value.toString(16).toUpperCase()})
          </span>
        ) : null}
        
        {/* Description */}
        {node.description && (
          <span className="node-description">
            - {node.description}
          </span>
        )}
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              activePermissions={activePermissions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionTreeView() {
  const { address, isConnected } = useAccount();
  const { resolverAddress } = useAppContext();
  const [domain, setDomain] = useState('');
  const [delegateToCheck, setDelegateToCheck] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['records', 'management', 'security']));
  const [activePermissions, setActivePermissions] = useState<bigint>(0n);
  const [delegateInfo, setDelegateInfo] = useState<{
    allowedOperations: bigint;
    expiresAt: bigint;
    enabled: boolean;
    locked: boolean;
    createdAt: bigint;
    createdBy: string;
  } | null>(null);

  const node = domain ? namehash(domain) : undefined;

  // Read delegate info from contract
  const { data: info, isLoading, isError } = useReadContract({
    address: resolverAddress as `0x${string}`,
    abi: granularABI,
    functionName: 'getDelegateInfo',
    args: node && delegateToCheck ? [node, delegateToCheck as `0x${string}`] : undefined,
    query: {
      enabled: !!resolverAddress && !!node && !!delegateToCheck && delegateToCheck.startsWith('0x'),
    },
  });

  useEffect(() => {
    if (info) {
      const [allowedOperations, expiresAt, enabled, locked, createdAt, createdBy] = info as [bigint, bigint, boolean, boolean, bigint, string];
      setDelegateInfo({ allowedOperations, expiresAt, enabled, locked, createdAt, createdBy });
      setActivePermissions(allowedOperations);
    } else {
      setDelegateInfo(null);
      setActivePermissions(0n);
    }
  }, [info]);

  // Define permission tree structure
  const permissionTree: PermissionNode[] = useMemo(() => [
    {
      id: 'records',
      name: 'RECORD MANAGEMENT',
      description: 'Permissions for managing ENS records',
      children: [
        {
          id: 'addr',
          name: 'SET_ADDR_RECORD',
          value: PERMISSIONS.SET_ADDR_RECORD,
          description: 'Set address resolution records',
        },
        {
          id: 'text',
          name: 'SET_TEXT_RECORD',
          value: PERMISSIONS.SET_TEXT_RECORD,
          description: 'Set text records (email, url, avatar, etc.)',
        },
        {
          id: 'contenthash',
          name: 'SET_CONTENT_HASH',
          value: PERMISSIONS.SET_CONTENT_HASH,
          description: 'Set IPFS/Swarm content hash',
        },
        {
          id: 'pubkey',
          name: 'SET_PUBKEY',
          value: PERMISSIONS.SET_PUBKEY,
          description: 'Set public key for encryption',
        },
        {
          id: 'abi',
          name: 'SET_ABI',
          value: PERMISSIONS.SET_ABI,
          description: 'Set contract ABI definition',
        },
      ],
    },
    {
      id: 'management',
      name: 'DOMAIN MANAGEMENT',
      description: 'Permissions for domain operations',
      children: [
        {
          id: 'subdomains',
          name: 'MANAGE_SUBDOMAINS',
          value: PERMISSIONS.MANAGE_SUBDOMAINS,
          description: 'Create and manage subdomains',
        },
        {
          id: 'resolver',
          name: 'SET_RESOLVER',
          value: PERMISSIONS.SET_RESOLVER,
          description: 'Change the resolver contract',
        },
        {
          id: 'owner',
          name: 'SET_OWNER',
          value: PERMISSIONS.SET_OWNER,
          description: 'Transfer domain ownership',
        },
        {
          id: 'ttl',
          name: 'SET_TTL',
          value: PERMISSIONS.SET_TTL,
          description: 'Set time-to-live for caching',
        },
      ],
    },
    {
      id: 'security',
      name: 'SECURITY & ADVANCED',
      description: 'Advanced security permissions',
      children: [
        {
          id: 'zonehash',
          name: 'SET_ZONEHASH',
          value: PERMISSIONS.SET_ZONEHASH,
          description: 'Set DNS zonehash for DNSSEC',
        },
        {
          id: 'fuses',
          name: 'SET_FUSES',
          value: PERMISSIONS.SET_FUSES,
          description: 'Burn fuses on wrapped names',
        },
      ],
    },
  ], []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = permissionTree.map(n => n.id);
    setExpanded(new Set(allIds));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  // Count active permissions
  const activeCount = useMemo(() => {
    return Object.values(PERMISSIONS).filter(
      perm => (activePermissions & perm) === perm
    ).length;
  }, [activePermissions]);

  const totalPermissions = Object.keys(PERMISSIONS).length;

  // Format expiration
  const formatExpiration = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Never';
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    if (date < now) return 'EXPIRED';
    return date.toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="permission-tree-container">
        <div className="tree-header">
          <span className="tree-title">PERMISSION TREE</span>
        </div>
        <div className="tree-message">
          Connect wallet to view permissions
        </div>
      </div>
    );
  }

  return (
    <div className="permission-tree-container">
      <style>{`
        .permission-tree-container {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          background: #fafafa;
          border: 1px solid #ddd;
        }
        .tree-header {
          background: #333;
          color: #fff;
          padding: 6px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tree-title {
          font-weight: bold;
          letter-spacing: 1px;
        }
        .tree-controls {
          display: flex;
          gap: 8px;
        }
        .tree-controls button {
          background: transparent;
          border: 1px solid #666;
          color: #fff;
          padding: 2px 6px;
          font-size: 10px;
          cursor: pointer;
        }
        .tree-controls button:hover {
          background: #555;
        }
        .tree-input-section {
          padding: 8px;
          background: #f0f0f0;
          border-bottom: 1px solid #ddd;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tree-input-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tree-input-group label {
          font-size: 11px;
          color: #666;
          min-width: 60px;
        }
        .tree-input-group input {
          padding: 3px 6px;
          border: 1px solid #ccc;
          font-family: inherit;
          font-size: 11px;
          min-width: 200px;
        }
        .tree-summary {
          padding: 6px 10px;
          background: #e8e8e8;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .summary-item {
          display: flex;
          gap: 4px;
        }
        .summary-label {
          color: #666;
        }
        .summary-value {
          font-weight: bold;
        }
        .summary-value.active { color: #059669; }
        .summary-value.inactive { color: #dc2626; }
        .summary-value.locked { color: #d97706; }
        .tree-body {
          padding: 8px;
          max-height: 400px;
          overflow-y: auto;
        }
        .tree-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 2px 0;
          cursor: default;
          white-space: nowrap;
        }
        .tree-row.has-children {
          cursor: pointer;
        }
        .tree-row.has-children:hover {
          background: #eee;
        }
        .tree-toggle {
          color: #666;
          width: 24px;
          text-align: center;
          font-weight: bold;
        }
        .status-indicator {
          font-weight: bold;
          width: 36px;
          text-align: center;
        }
        .status-indicator.active {
          color: #059669;
        }
        .status-indicator.inactive {
          color: #999;
        }
        .category-status {
          color: #1e40af;
          font-weight: bold;
        }
        .node-name {
          color: #333;
        }
        .node-name.category {
          font-weight: bold;
          color: #1e40af;
        }
        .permission-value {
          color: #888;
          font-size: 10px;
        }
        .node-description {
          color: #666;
          font-style: italic;
        }
        .tree-message {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        .tree-message.error {
          color: #dc2626;
        }
        .tree-hint {
          padding: 6px 10px;
          background: #fffbeb;
          border-bottom: 1px solid #fcd34d;
          color: #92400e;
          font-size: 11px;
        }
        .tree-legend {
          padding: 6px 10px;
          background: #333;
          color: #aaa;
          font-size: 10px;
          display: flex;
          gap: 16px;
          border-top: 1px solid #444;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .legend-indicator {
          font-weight: bold;
        }
        .legend-indicator.on { color: #4ade80; }
        .legend-indicator.off { color: #666; }
      `}</style>
      
      <div className="tree-header">
        <span className="tree-title">PERMISSION TREE VIEW</span>
        <div className="tree-controls">
          <button onClick={expandAll}>[Expand All]</button>
          <button onClick={collapseAll}>[Collapse All]</button>
        </div>
      </div>

      <div className="tree-input-section">
        <div className="tree-input-group">
          <label>Domain:</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.eth"
          />
        </div>
        <div className="tree-input-group">
          <label>Delegate:</label>
          <input
            type="text"
            value={delegateToCheck}
            onChange={(e) => setDelegateToCheck(e.target.value)}
            placeholder="0x..."
          />
        </div>
      </div>

      {delegateInfo && (
        <div className="tree-summary">
          <div className="summary-item">
            <span className="summary-label">Permissions:</span>
            <span className={`summary-value ${activeCount > 0 ? 'active' : 'inactive'}`}>
              {activeCount}/{totalPermissions}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Status:</span>
            <span className={`summary-value ${delegateInfo.enabled ? 'active' : 'inactive'}`}>
              {delegateInfo.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Locked:</span>
            <span className={`summary-value ${delegateInfo.locked ? 'locked' : ''}`}>
              {delegateInfo.locked ? 'YES' : 'NO'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Expires:</span>
            <span className="summary-value">
              {formatExpiration(delegateInfo.expiresAt)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mask:</span>
            <span className="summary-value">
              0x{activePermissions.toString(16).toUpperCase().padStart(4, '0')}
            </span>
          </div>
        </div>
      )}

      {isError && (
        <div className="tree-message error">Error loading permissions. Check resolver address and inputs.</div>
      )}

      {!isLoading && (!domain || !delegateToCheck) && (
        <div className="tree-hint">
          Enter a domain and delegate address above to check active permissions
        </div>
      )}

      <div className="tree-body">
        {permissionTree.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={toggleExpand}
            activePermissions={activePermissions}
          />
        ))}
      </div>

      <div className="tree-legend">
        <div className="legend-item">
          <span className="legend-indicator on">[ON]</span>
          <span>= Permission granted</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator off">[--]</span>
          <span>= Permission denied</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator">[+]/[-]</span>
          <span>= Expand/Collapse</span>
        </div>
      </div>
    </div>
  );
}

