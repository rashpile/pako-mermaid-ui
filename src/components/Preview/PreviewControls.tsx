import React from 'react';
import { exportDiagram, generateFilename } from '../../utils/export';
import { ExportFormat } from '../../types';

interface PreviewControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitToScreen: () => void;
  isRendering: boolean;
  canExport: boolean;
  onUpdatePreview?: () => void;
  hasContentChanged?: boolean;
}

export function PreviewControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  isRendering,
  canExport,
  onUpdatePreview,
  hasContentChanged
}: PreviewControlsProps) {
  const handleExport = async (format: ExportFormat) => {
    if (!canExport) return;
    
    const container = document.querySelector('.mermaid-container') as HTMLElement;
    if (!container) return;
    
    try {
      const filename = generateFilename('mermaid-diagram', format);
      await exportDiagram(container, format, { filename });
    } catch (error) {
      console.error(`Failed to export ${format.toUpperCase()}:`, error);
      // Could show a toast notification here
    }
  };

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="preview-controls flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onZoomOut}
          disabled={isRendering || zoom <= 0.1}
          className="btn-outline px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          −
        </button>
        
        <span className="text-sm font-mono min-w-[4rem] text-center">
          {zoomPercentage}%
        </span>
        
        <button
          onClick={onZoomIn}
          disabled={isRendering || zoom >= 3}
          className="btn-outline px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          +
        </button>
        
        <button
          onClick={onZoomReset}
          disabled={isRendering}
          className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset Zoom (100%)"
        >
          Reset
        </button>
        
        <button
          onClick={onFitToScreen}
          disabled={isRendering}
          className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fit to Screen"
        >
          Fit
        </button>
      </div>

      {/* Update Preview Button */}
      {onUpdatePreview && (
        <div className="flex items-center">
          <button
            onClick={onUpdatePreview}
            disabled={isRendering || !hasContentChanged}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              hasContentChanged 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={hasContentChanged ? 'Update preview with latest changes' : 'Preview is up to date'}
          >
            {hasContentChanged ? '🔄 Update Preview' : '✓ Up to Date'}
          </button>
        </div>
      )}

      {/* Export Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Export:</span>
        
        <button
          onClick={() => handleExport('png')}
          disabled={!canExport || isRendering}
          className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as PNG"
        >
          PNG
        </button>
        
        <button
          onClick={() => handleExport('svg')}
          disabled={!canExport || isRendering}
          className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as SVG"
        >
          SVG
        </button>
        
        <button
          onClick={() => handleExport('pdf')}
          disabled={!canExport || isRendering}
          className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as PDF"
        >
          PDF
        </button>
      </div>
    </div>
  );
}