// Preview controls component
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
}

export function PreviewControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  isRendering,
  canExport
}: PreviewControlsProps) {
  const handleExport = async () => {
    if (!canExport) return;
    
    const container = document.querySelector('.mermaid-container') as HTMLElement;
    if (!container) return;
    
    try {
      const filename = generateFilename('mermaid-diagram', 'svg');
      await exportDiagram(container, 'svg', { filename });
    } catch (error) {
      console.error('Failed to export SVG:', error);
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

      
      {/* Export Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleExport}
          disabled={!canExport || isRendering}
          className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as SVG"
        >
          Export SVG
        </button>
      </div>
    </div>
  );
}