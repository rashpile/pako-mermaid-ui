import { ExportFormat, ExportOptions } from '../types';
import { exportToSVG as exportSVG } from './exportToSVG';

/**
 * Export utilities for saving Mermaid diagrams as SVG
 */

// Export diagram as SVG using enhanced SVG exporter
export async function exportToSVG(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const { filename = 'mermaid-diagram' } = options;

  try {
    await exportSVG(element, {
      filename,
      includeStyles: true,
      backgroundColor: 'transparent'
    });
    
    return 'SVG export completed';
  } catch (error) {
    throw new Error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generic export function (now only handles SVG)
export async function exportDiagram(
  element: HTMLElement,
  format: ExportFormat,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  if (format === 'svg') {
    return exportToSVG(element, options);
  }
  throw new Error(`Unsupported export format: ${format}`);
}

// Utility to generate filename with timestamp
export function generateFilename(baseName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}-${timestamp}.${format}`;
}

// Utility to validate export element
export function validateExportElement(element: HTMLElement): void {
  if (!element) {
    throw new Error('Export element is required');
  }
  
  if (!element.offsetWidth || !element.offsetHeight) {
    throw new Error('Export element has no visible dimensions');
  }
  
  // For SVG exports, ensure there's an SVG element
  const svgElement = element.querySelector('svg');
  if (!svgElement) {
    console.warn('No SVG element found - PNG/PDF export will capture the entire container');
  }
}