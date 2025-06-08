import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useDiagram } from '../../hooks/useDiagram';
import { ExportButtons } from './ExportButtons';
import { ExampleSelector } from './ExampleSelector';
import { ThemeToggle } from './ThemeToggle';
import { ChatToggle } from './ChatToggle';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const { settings, layoutSettings, updateLayoutSettings } = useSettingsStore();
  const { currentDiagram, saveDiagram, loadDiagram, clearDiagram } = useDiagram();

  // Handle new diagram
  const handleNew = () => {
    if (currentDiagram.content.trim() && 
        !confirm('Create a new diagram? Current changes will be lost.')) {
      return;
    }
    clearDiagram();
  };

  // Handle save
  const handleSave = () => {
    const name = prompt('Enter diagram name:', currentDiagram.name || 'Untitled');
    if (name) {
      saveDiagram(name);
    }
  };

  // Handle chat panel toggle
  const handleChatToggle = () => {
    updateLayoutSettings({
      showRightPanel: !layoutSettings.showRightPanel
    });
  };

  return (
    <div className={`toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left section - File operations */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNew}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="New diagram (Ctrl+N)"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>

          <button
            onClick={handleSave}
            disabled={!currentDiagram.content.trim()}
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Save diagram (Ctrl+S)"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Save
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <ExampleSelector />
        </div>

        {/* Center section - Diagram info */}
        <div className="flex items-center space-x-4">
          {currentDiagram.name && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentDiagram.name}
            </span>
          )}
          
          {currentDiagram.lastModified && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Modified: {new Date(currentDiagram.lastModified).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Right section - Tools and toggles */}
        <div className="flex items-center space-x-2">
          <ExportButtons />
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          <ChatToggle 
            isVisible={layoutSettings.showRightPanel}
            onToggle={handleChatToggle}
          />
          
          <ThemeToggle />
          
          {/* Settings button */}
          <button
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}