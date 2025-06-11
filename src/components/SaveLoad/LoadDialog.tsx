import React, { useState, useCallback, useEffect } from 'react';
import { useDiagram } from '../../hooks/useDiagram';
import { useDiagramStore } from '../../store/diagramStore';
import { DiagramData } from '../../types';
import { DiagramList } from './DiagramList';

interface LoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiagram?: DiagramData;
}

export function LoadDialog({ isOpen, onClose, currentDiagram }: LoadDialogProps) {
  const { savedDiagrams, loadDiagram, deleteDiagram } = useDiagram();
  const { loadSavedDiagrams } = useDiagramStore();
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'created'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort diagrams
  const filteredAndSortedDiagrams = React.useMemo(() => {
    const filtered = savedDiagrams.filter(diagram =>
      diagram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (diagram.description && diagram.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'modified':
          aValue = new Date(a.lastModified || 0);
          bValue = new Date(b.lastModified || 0);
          break;
        case 'created':
          aValue = new Date(a.created || 0);
          bValue = new Date(b.created || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [savedDiagrams, searchTerm, sortBy, sortOrder]);

  // Handle load diagram
  const handleLoad = useCallback(async (diagram: DiagramData) => {
    console.log('[LoadDialog] Attempting to load diagram:', diagram.name, 'ID:', diagram.id);
    
    // Check if current diagram has unsaved changes
    if (currentDiagram?.content.trim() && 
        !confirm('Load diagram? Current changes will be lost.')) {
      console.log('[LoadDialog] Load cancelled by user');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[LoadDialog] Calling loadDiagram with ID:', diagram.id);
      const result = await loadDiagram(diagram.id);
      console.log('[LoadDialog] Load result:', result);
      onClose();
    } catch (error) {
      console.error('[LoadDialog] Failed to load diagram:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDiagram, loadDiagram, onClose]);

  // Handle delete diagram
  const handleDelete = useCallback(async (diagram: DiagramData) => {
    if (!confirm(`Delete "${diagram.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDiagram(diagram.id);
      if (selectedDiagram?.id === diagram.id) {
        setSelectedDiagram(null);
      }
    } catch (error) {
      console.error('Failed to delete diagram:', error);
    }
  }, [deleteDiagram, selectedDiagram]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && selectedDiagram) {
      handleLoad(selectedDiagram);
    }
  }, [onClose, selectedDiagram, handleLoad]);

  // Load saved diagrams when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log('[LoadDialog] Loading saved diagrams...');
      loadSavedDiagrams();
      console.log('[LoadDialog] Current saved diagrams count:', savedDiagrams.length);
    }
  }, [isOpen, loadSavedDiagrams, savedDiagrams.length]);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedDiagram(null);
      setSearchTerm('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Load Diagram
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

        <div className="p-6 flex-1 overflow-hidden">
          {/* Search and sort controls */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search diagrams..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'modified' | 'created')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="modified">Modified</option>
                <option value="created">Created</option>
                <option value="name">Name</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {filteredAndSortedDiagrams.length} of {savedDiagrams.length} diagrams
            {searchTerm && ` matching "${searchTerm}"`}
          </div>

          {/* Diagram list */}
          <div className="flex-1 overflow-auto">
            {filteredAndSortedDiagrams.length === 0 ? (
              <div className="text-center py-12">
                {savedDiagrams.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">No saved diagrams</p>
                    <p className="text-sm">Create and save a diagram to see it here</p>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">No matching diagrams</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            ) : (
              <DiagramList
                diagrams={filteredAndSortedDiagrams}
                selectedDiagram={selectedDiagram}
                onSelect={setSelectedDiagram}
                onLoad={handleLoad}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedDiagram ? `Selected: ${selectedDiagram.name}` : 'Select a diagram to load'}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedDiagram && handleLoad(selectedDiagram)}
              disabled={!selectedDiagram || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isLoading ? 'Loading...' : 'Load Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}