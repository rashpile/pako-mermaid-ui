import React, { useState } from 'react';
import { useOpenAI } from '../../hooks/useOpenAI';

export function ApiKeySettings() {
  const {
    hasApiKey,
    isValidKey,
    isValidating,
    validationError,
    setApiKey,
    removeApiKey,
    validateApiKey,
    validateApiKeyFormat,
    formatApiKeyForDisplay,
    statusMessage
  } = useOpenAI();

  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(!hasApiKey);
  const [showKey, setShowKey] = useState(false);

  // Handle API key submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!validateApiKeyFormat(inputValue)) {
      return;
    }

    const success = await setApiKey(inputValue.trim());
    if (success) {
      setInputValue('');
      setIsEditing(false);
      setShowKey(false);
    }
  };

  // Handle remove API key
  const handleRemove = () => {
    if (confirm('Are you sure you want to remove your API key?')) {
      removeApiKey();
      setInputValue('');
      setIsEditing(true);
      setShowKey(false);
    }
  };

  // Get status color
  const getStatusColor = () => {
    if (isValidating) return 'text-yellow-500';
    if (!hasApiKey) return 'text-gray-500';
    if (isValidKey === false) return 'text-red-500';
    if (isValidKey === true) return 'text-green-500';
    return 'text-gray-500';
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isValidating) return '⏳';
    if (!hasApiKey) return '🔑';
    if (isValidKey === false) return '❌';
    if (isValidKey === true) return '✅';
    return '🔑';
  };

  return (
    <div className="api-key-settings bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          OpenAI API Configuration
        </h4>
        <div className={`flex items-center space-x-1 text-xs ${getStatusColor()}`}>
          <span>{getStatusIcon()}</span>
          <span>{statusMessage}</span>
        </div>
      </div>

      {!isEditing && hasApiKey ? (
        // Display existing API key
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                API Key:
              </span>
              <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {showKey ? inputValue || '••••••••••••••••' : formatApiKeyForDisplay()}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {isValidKey !== true && (
                <button
                  onClick={validateApiKey}
                  disabled={isValidating}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </button>
              )}
              
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Edit
              </button>
              
              <button
                onClick={handleRemove}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                Remove
              </button>
            </div>
          </div>

          {validationError && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {validationError}
            </div>
          )}
        </div>
      ) : (
        // API key input form
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              autoComplete="off"
              data-1p-ignore
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Get your API key from OpenAI →
            </a>
            
            <div className="flex items-center space-x-2">
              {hasApiKey && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={!inputValue.trim() || !validateApiKeyFormat(inputValue)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {hasApiKey ? 'Update' : 'Save'} API Key
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Help Text */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 The AI assistant can help you create, modify, and improve Mermaid diagrams using natural language.
        </p>
      </div>
    </div>
  );
}