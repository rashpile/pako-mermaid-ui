import React, { useState } from 'react';
import { useDiagram } from '../../hooks/useDiagram';

export function ExportButtons() {
  const { currentDiagram, exportDiagram } = useDiagram();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Handle export with loading state
  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!currentDiagram.content.trim()) {
      setExportStatus('No diagram to export');
      setTimeout(() => setExportStatus(null), 3000);
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      await exportDiagram(format);
      setExportStatus(`Exported as ${format.toUpperCase()}`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Export failed');
      setTimeout(() => setExportStatus(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Export dropdown */}
      <div className="relative group">
        <button
          disabled={isExporting || !currentDiagram.content.trim()}
          className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          title="Export diagram"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Exporting...' : 'Export'}
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting || !currentDiagram.content.trim()}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              PNG Image
            </button>
            <button
              onClick={() => handleExport('svg')}
              disabled={isExporting || !currentDiagram.content.trim()}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              SVG Vector
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting || !currentDiagram.content.trim()}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Document
            </button>
          </div>
        </div>
      </div>

      {/* Export status indicator */}
      {exportStatus && (
        <div className={`ml-2 px-2 py-1 text-xs rounded ${
          exportStatus.includes('failed') 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {exportStatus}
        </div>
      )}
    </div>
  );
}