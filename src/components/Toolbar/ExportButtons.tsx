import { useState } from 'react';
import { useDiagram } from '../../hooks/useDiagram';
import { validateElementForSVGExport } from '../../utils/exportToSVG';
import { exportToSVG } from '../../utils/exportToSVG';

export function ExportButtons() {
  const { currentDiagram } = useDiagram();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Get export target element
  const getExportElement = (): HTMLElement | null => {
    // Try to find the Mermaid preview container
    const previewContainer = document.querySelector('[data-mermaid-preview]') as HTMLElement;
    if (previewContainer) return previewContainer;

    // Fallback to any SVG container
    const svgContainer = document.querySelector('.mermaid-preview, .mermaid-container') as HTMLElement;
    if (svgContainer) return svgContainer;

    // Last resort - find any element with SVG
    const elementWithSvg = document.querySelector('svg')?.parentElement as HTMLElement;
    return elementWithSvg || null;
  };

  // Validate export capability for SVG
  const canExport = (): boolean => {
    if (!currentDiagram?.content?.trim()) return false;
    
    const element = getExportElement();
    if (!element) return false;

    return validateElementForSVGExport(element);
  };

  // Handle SVG export
  const handleExport = async () => {
    const element = getExportElement();
    
    if (!element) {
      setExportStatus('Preview not found - render diagram first');
      setTimeout(() => setExportStatus(null), 3000);
      return;
    }

    if (!canExport()) {
      setExportStatus('Cannot export as SVG - invalid diagram');
      setTimeout(() => setExportStatus(null), 3000);
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      // Generate filename with diagram name
      const filename = currentDiagram?.name 
        ? currentDiagram.name.replace(/[^a-z0-9]/gi, '_') 
        : 'mermaid-diagram';

      await exportToSVG(element, { filename });
      setExportStatus('Exported as SVG');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setExportStatus(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {/* SVG Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !canExport()}
        className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
        title={!canExport() ? 'SVG content not found - render diagram first' : 'Export as SVG vector'}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? 'Exporting...' : 'Export SVG'}
        {!canExport() && (
          <span className="ml-1 text-xs text-red-500">⚠</span>
        )}
      </button>

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