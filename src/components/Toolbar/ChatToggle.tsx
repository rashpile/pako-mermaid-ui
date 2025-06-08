import React from 'react';

interface ChatToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ChatToggle({ isVisible, onToggle, disabled = false }: ChatToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        p-1.5 rounded transition-colors
        ${isVisible 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={`${isVisible ? 'Hide' : 'Show'} AI chat panel`}
      aria-label={`${isVisible ? 'Hide' : 'Show'} AI chat panel`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>
    </button>
  );
}