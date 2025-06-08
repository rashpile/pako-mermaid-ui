import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ExportFormat, ExportOptions } from '../types';

/**
 * Export utilities for saving Mermaid diagrams in various formats
 */

// Export diagram as PNG using html2canvas
export async function exportToPNG(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const {
    filename = 'mermaid-diagram.png',
    quality = 1,
    scale = 2
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
      ...options
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }

          // Create download URL
          const url = URL.createObjectURL(blob);
          
          // Trigger download
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          URL.revokeObjectURL(url);
          resolve(url);
        },
        'image/png',
        quality
      );
    });
  } catch (error) {
    throw new Error(`PNG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export diagram as SVG
export async function exportToSVG(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const { filename = 'mermaid-diagram.svg' } = options;

  try {
    // Find the SVG element within the container
    const svgElement = element.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in the provided container');
    }

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Ensure the SVG has proper dimensions
    if (!clonedSvg.getAttribute('width') || !clonedSvg.getAttribute('height')) {
      const bbox = svgElement.getBBox();
      clonedSvg.setAttribute('width', bbox.width.toString());
      clonedSvg.setAttribute('height', bbox.height.toString());
      clonedSvg.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
    }

    // Add XML namespace if not present
    if (!clonedSvg.getAttribute('xmlns')) {
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Serialize the SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return url;
  } catch (error) {
    throw new Error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export diagram as PDF
export async function exportToPDF(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const {
    filename = 'mermaid-diagram.pdf',
    scale = 2
  } = options;

  try {
    // First convert to canvas
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false
    });

    // Calculate dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Create PDF with appropriate size
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(filename);
    
    return imgData;
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