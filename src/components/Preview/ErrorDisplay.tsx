import React, { useState } from 'react';

interface ErrorDisplayProps {
  error: string;
  warnings?: string[];
  className?: string;
}

export function ErrorDisplay({ error, warnings = [], className = '' }: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!error && warnings.length === 0) {
    return null;
  }

  return (
    <div className={`error-display bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Syntax Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className={`${error ? 'mt-3 pt-3 border-t border-red-200 dark:border-red-700' : ''}`}>
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Warnings ({warnings.length})
                </h4>
                {warnings.length > 1 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
                  >
                    {isExpanded ? 'Show less' : 'Show all'}
                  </button>
                )}
              </div>
              
              {warnings.length === 1 || isExpanded ? (
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="block w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {warnings[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        <p>💡 Check your Mermaid syntax. Visit <a href="https://mermaid.js.org/syntax/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">mermaid.js.org</a> for documentation.</p>
      </div>
    </div>
  );
}