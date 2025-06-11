import { useState } from 'react';
import { useDiagram } from '../../hooks/useDiagram';
import { validateElementForPNGExport } from '../../utils/exportToPNG';
import { validateElementForSVGExport } from '../../utils/exportToSVG';
import { validateElementForPDFExport } from '../../utils/exportToPDF';
import { exportToPNG } from '../../utils/exportToPNG';
import { exportToSVG } from '../../utils/exportToSVG';
import { exportToPDF } from '../../utils/exportToPDF';

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

  // Validate export capability for format
  const canExport = (format: 'png' | 'svg' | 'pdf'): boolean => {
    if (!currentDiagram?.content?.trim()) return false;
    
    const element = getExportElement();
    if (!element) return false;

    switch (format) {
      case 'png':
        return validateElementForPNGExport(element);
      case 'svg':
        return validateElementForSVGExport(element);
      case 'pdf':
        return validateElementForPDFExport(element);
      default:
        return false;
    }
  };

  // Handle export with enhanced validation
  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    const element = getExportElement();
    
    if (!element) {
      setExportStatus('Preview not found - render diagram first');
      setTimeout(() => setExportStatus(null), 3000);
      return;
    }

    if (!canExport(format)) {
      setExportStatus(`Cannot export as ${format.toUpperCase()} - invalid diagram`);
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

      // Export based on format
      switch (format) {
        case 'png':
          await exportToPNG(element, { filename });
          break;
        case 'svg':
          await exportToSVG(element, { filename });
          break;
        case 'pdf':
          await exportToPDF(element, { filename });
          break;
      }
      setExportStatus(`Exported as ${format.toUpperCase()}`);
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
      {/* Export dropdown */}
      <div className="relative group">
        <button
          disabled={isExporting || !currentDiagram?.content?.trim()}
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
              disabled={isExporting || !canExport('png')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canExport('png') ? 'Render diagram first' : 'Export as PNG image'}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              PNG Image
              {!canExport('png') && (
                <span className="ml-1 text-xs text-red-500">⚠</span>
              )}
            </button>
            <button
              onClick={() => handleExport('svg')}
              disabled={isExporting || !canExport('svg')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canExport('svg') ? 'SVG content not found' : 'Export as SVG vector'}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              SVG Vector
              {!canExport('svg') && (
                <span className="ml-1 text-xs text-red-500">⚠</span>
              )}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting || !canExport('pdf')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canExport('pdf') ? 'Render diagram first' : 'Export as PDF document'}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Document
              {!canExport('pdf') && (
                <span className="ml-1 text-xs text-red-500">⚠</span>
              )}
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