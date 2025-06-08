import { ExportFormat, ExportOptions } from '../types';
import { exportToPNG as exportPNG } from './exportToPNG';
import { exportToSVG as exportSVG } from './exportToSVG';
import { exportToPDF as exportPDF } from './exportToPDF';

/**
 * Export utilities for saving Mermaid diagrams in various formats
 */

// Export diagram as PNG using enhanced PNG exporter
export async function exportToPNG(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const {
    filename = 'mermaid-diagram',
    quality = 1,
    scale = 2
  } = options;

  try {
    await exportPNG(element, {
      filename,
      quality,
      scale,
      backgroundColor: '#ffffff'
    });
    
    return 'PNG export completed';
  } catch (error) {
    throw new Error(`PNG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

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

// Export diagram as PDF using enhanced PDF exporter
export async function exportToPDF(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const { filename = 'mermaid-diagram' } = options;

  try {
    await exportPDF(element, {
      filename,
      format: 'a4',
      orientation: 'landscape',
      fitToPage: true,
      backgroundColor: '#ffffff',
      title: 'Mermaid Diagram'
    });
    
    return 'PDF export completed';
  } catch (error) {
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generic export function that routes to specific format handlers
export async function exportDiagram(
  element: HTMLElement,
  format: ExportFormat,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  switch (format) {
    case 'png':
      return exportToPNG(element, options);
    case 'svg':
      return exportToSVG(element, options);
    case 'pdf':
      return exportToPDF(element, options);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
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