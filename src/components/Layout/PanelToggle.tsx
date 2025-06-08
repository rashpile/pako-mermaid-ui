import React from 'react';

interface PanelToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  label: string;
  position: 'left' | 'right';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function PanelToggle({
  isVisible,
  onToggle,
  label,
  position,
  icon,
  disabled = false,
  className = ''
}: PanelToggleProps) {
  const positionClasses = {
    left: 'rounded-r-md border-r',
    right: 'rounded-l-md border-l'
  };

  const iconDirection = {
    left: isVisible ? '‹' : '›',
    right: isVisible ? '›' : '‹'
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        fixed top-1/2 transform -translate-y-1/2 z-40
        ${position === 'left' ? 'left-0' : 'right-0'}
        ${positionClasses[position]}
        bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
        text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
        hover:bg-gray-50 dark:hover:bg-gray-700
        px-2 py-4 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg hover:shadow-xl
        ${className}
      `}
      title={`${isVisible ? 'Hide' : 'Show'} ${label}`}
      aria-label={`${isVisible ? 'Hide' : 'Show'} ${label}`}
    >
      <div className="flex flex-col items-center space-y-1">
        {icon || (
          <span className="text-lg font-bold">
            {iconDirection[position]}
          </span>
        )}
        <span className="text-xs font-medium transform -rotate-90 whitespace-nowrap">
          {label}
        </span>
      </div>
    </button>
  );
}

// Preset toggle components for common panels
interface ChatToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ChatToggle({ isVisible, onToggle, disabled }: ChatToggleProps) {
  return (
    <PanelToggle
      isVisible={isVisible}
      onToggle={onToggle}
      label="Chat"
      position="right"
      disabled={disabled}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      }
    />
  );
}

interface EditorToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function EditorToggle({ isVisible, onToggle, disabled }: EditorToggleProps) {
  return (
    <PanelToggle
      isVisible={isVisible}
      onToggle={onToggle}
      label="Editor"
      position="left"
      disabled={disabled}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
          />
        </svg>
      }
    />
  );
}