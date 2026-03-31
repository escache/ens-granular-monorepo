interface Shortcut {
  key: string;
  description: string;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  onClose: () => void;
}

export function KeyboardShortcuts({ shortcuts, onClose }: KeyboardShortcutsProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="text-base font-semibold">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="btn btn-icon btn-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body p-md">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut, index) => (
                <tr key={index}>
                  <td>
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                      {shortcut.key}
                    </kbd>
                  </td>
                  <td className="text-xs">{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

