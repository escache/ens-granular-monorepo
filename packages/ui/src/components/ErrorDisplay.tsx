interface ErrorDisplayProps {
  error: string | Error | unknown;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error 
    ? error.message 
    : 'An unknown error occurred';

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Error</p>
        <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-3 text-red-600 hover:text-red-800"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}

