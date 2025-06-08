import React, { KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Ask me to modify your diagram...",
  maxLength = 1000
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Get character count color
  const getCharCountColor = () => {
    const percentage = value.length / maxLength;
    if (percentage > 0.9) return 'text-red-500';
    if (percentage > 0.7) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className={`
            w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            px-3 py-2 pr-12 text-sm
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
            disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className={`
            absolute right-2 top-1/2 transform -translate-y-1/2
            w-8 h-8 rounded-md flex items-center justify-center
            ${
              value.trim() && !disabled
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
            }
            transition-colors duration-200
          `}
          title="Send message (Enter)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </button>
      </div>
      
      {/* Character Count & Help Text */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="text-gray-500 dark:text-gray-400">
          <span>Press </span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border text-xs">Enter</kbd>
          <span> to send, </span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border text-xs">Shift+Enter</kbd>
          <span> for new line</span>
        </div>
        
        <div className={`${getCharCountColor()}`}>
          {value.length}/{maxLength}
        </div>
      </div>
    </form>
  );
}