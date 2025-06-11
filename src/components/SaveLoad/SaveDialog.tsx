import React, { useState, useCallback } from 'react';
import { useDiagram } from '../../hooks/useDiagram';
import { DiagramData } from '../../types';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiagram?: DiagramData;
}

export function SaveDialog({ isOpen, onClose, currentDiagram }: SaveDialogProps) {
  const { saveDiagram, savedDiagrams, updateName } = useDiagram();
  const [name, setName] = useState(currentDiagram?.name || '');
  const [description, setDescription] = useState(currentDiagram?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if name already exists
  const nameExists = savedDiagrams.some(diagram => 
    diagram.name.toLowerCase() === name.toLowerCase() && 
    diagram.id !== currentDiagram?.id
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!name.trim() || !currentDiagram?.content.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update the diagram name and description first
      updateName(name.trim());
      // TODO: Add updateDescription method to store if needed
      
      // Then save
      const success = await saveDiagram();
      if (success) {
        onClose();
        setName('');
        setDescription('');
      } else {
        setError('Failed to save diagram');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save diagram');
    } finally {
      setIsSaving(false);
    }
  }, [name, description, currentDiagram, saveDiagram, onClose]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && name.trim() && !nameExists) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [name, nameExists, handleSave, onClose]);

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsSaving(false);
    } else {
      // Set default name if empty
      if (!name && currentDiagram?.content) {
        const diagramType = currentDiagram.content.split('\n')[0].split(' ')[0];
        const timestamp = new Date().toLocaleDateString();
        setName(`${diagramType} - ${timestamp}`);
      }
    }
  }, [isOpen, name, currentDiagram]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Save Diagram
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name input */}
          <div>
            <label htmlFor="diagram-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagram Name *
            </label>
            <input
              id="diagram-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter diagram name"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                nameExists 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              autoFocus
            />
            {nameExists && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                A diagram with this name already exists
              </p>
            )}
          </div>

          {/* Description input */}
          <div>
            <label htmlFor="diagram-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="diagram-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter diagram description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Diagram info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagram Info
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Lines: {currentDiagram?.content.split('\n').length || 0}</div>
              <div>Characters: {currentDiagram?.content.length || 0}</div>
              <div>Type: {currentDiagram?.content.split('\n')[0]?.split(' ')[0] || 'Unknown'}</div>
              {currentDiagram?.lastModified && (
                <div>Modified: {new Date(currentDiagram.lastModified).toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || nameExists || isSaving || !currentDiagram?.content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving && (
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isSaving ? 'Saving...' : 'Save Diagram'}
          </button>
        </div>
      </div>
    </div>
  );
}