import jsPDF from 'jspdf';
import { getSVGString, getSVGDimensions } from './exportToSVG';
import { getPNGDataURL } from './exportToPNG';

export interface PDFExportOptions {
  filename?: string;
  format?: 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'custom';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  fitToPage?: boolean;
  backgroundColor?: string;
  quality?: number;
  customWidth?: number;
  customHeight?: number;
}

export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'mermaid-diagram',
    format = 'a4',
    orientation = 'portrait',
    margin = 20,
    title = 'Mermaid Diagram',
    author = 'Mermaid Editor',
    subject = 'Generated Diagram',
    keywords = 'mermaid, diagram, flowchart',
    fitToPage = true,
    backgroundColor = '#ffffff',
    quality = 1
  } = options;

  try {
    // Create PDF document
    const pdf = createPDFDocument(format, orientation, options);
    
    // Set document metadata
    pdf.setProperties({
      title,
      author,
      subject,
      keywords,
      creator: 'Mermaid Editor'
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    // Try SVG export first, fallback to PNG
    let success = false;
    
    try {
      success = await addSVGToPDF(pdf, element, {
        x: margin,
        y: margin,
        width: availableWidth,
        height: availableHeight,
        fitToPage,
        backgroundColor
      });
    } catch (svgError) {
      console.warn('SVG export failed, falling back to PNG:', svgError);
    }

    if (!success) {
      await addPNGToPDF(pdf, element, {
        x: margin,
        y: margin,
        width: availableWidth,
        height: availableHeight,
        fitToPage,
        backgroundColor,
        quality
      });
    }

    // Add footer with metadata
    addFooter(pdf, {
      text: `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth,
      pageHeight
    });

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create PDF document with specified format and orientation
function createPDFDocument(
  format: PDFExportOptions['format'],
  orientation: PDFExportOptions['orientation'],
  options: PDFExportOptions
): jsPDF {
  if (format === 'custom' && options.customWidth && options.customHeight) {
    return new jsPDF({
      orientation: orientation!,
      unit: 'mm',
      format: [options.customWidth, options.customHeight]
    });
  }

  return new jsPDF({
    orientation: orientation!,
    unit: 'mm',
    format: format === 'custom' ? 'a4' : format!
  });
}

// Add SVG content to PDF
async function addSVGToPDF(
  pdf: jsPDF,
  element: HTMLElement,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    fitToPage: boolean;
    backgroundColor: string;
  }
): Promise<boolean> {
  try {
    const svgString = await getSVGString(element, {
      backgroundColor: options.backgroundColor,
      includeStyles: true
    });

    const svgDimensions = getSVGDimensions(element);
    if (!svgDimensions) {
      throw new Error('Could not determine SVG dimensions');
    }

    let { width, height } = svgDimensions;
    
    if (options.fitToPage) {
      const scale = Math.min(
        options.width / width,
        options.height / height
      );
      
      width *= scale;
      height *= scale;
    }

    // Center the content
    const x = options.x + (options.width - width) / 2;
    const y = options.y + (options.height - height) / 2;

    // Add SVG to PDF
    pdf.addSvgAsImage(svgString, x, y, width, height);
    
    return true;
  } catch (error) {
    console.error('Failed to add SVG to PDF:', error);
    return false;
  }
}

// Add PNG content to PDF
async function addPNGToPDF(
  pdf: jsPDF,
  element: HTMLElement,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    fitToPage: boolean;
    backgroundColor: string;
    quality: number;
  }
): Promise<void> {
  try {
    const dataURL = await getPNGDataURL(element, {
      backgroundColor: options.backgroundColor,
      quality: options.quality,
      scale: 2
    });

    // Create temporary image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });

    let { width, height } = { width: img.width, height: img.height };
    
    if (options.fitToPage) {
      const scale = Math.min(
        options.width / (width * 0.75), // Convert pixels to points
        options.height / (height * 0.75)
      );
      
      width = (width * 0.75) * scale;
      height = (height * 0.75) * scale;
    } else {
      width *= 0.75; // Convert pixels to points
      height *= 0.75;
    }

    // Center the content
    const x = options.x + (options.width - width) / 2;
    const y = options.y + (options.height - height) / 2;

    pdf.addImage(dataURL, 'PNG', x, y, width, height);
  } catch (error) {
    console.error('Failed to add PNG to PDF:', error);
    throw error;
  }
}

// Add footer to PDF
function addFooter(
  pdf: jsPDF,
  options: {
    text: string;
    pageWidth: number;
    pageHeight: number;
  }
): void {
  try {
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    
    const textWidth = pdf.getTextWidth(options.text);
    const x = (options.pageWidth - textWidth) / 2;
    const y = options.pageHeight - 10;
    
    pdf.text(options.text, x, y);
  } catch (error) {
    console.warn('Failed to add footer:', error);
  }
}

// Export multi-page PDF (for very large diagrams)
export async function exportToMultiPagePDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'mermaid-diagram',
    format = 'a4',
    orientation = 'landscape',
    margin = 20
  } = options;

  try {
    const pdf = createPDFDocument(format, orientation, options);
    
    // Get element dimensions
    const rect = element.getBoundingClientRect();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    // Calculate number of pages needed
    const scale = Math.min(
      availableWidth / rect.width,
      availableHeight / rect.height
    );
    
    if (scale >= 1) {
      // Single page is sufficient
      return exportToPDF(element, options);
    }
    
    // Calculate grid of pages
    const pagesX = Math.ceil(rect.width * scale / availableWidth);
    const pagesY = Math.ceil(rect.height * scale / availableHeight);
    
    for (let y = 0; y < pagesY; y++) {
      for (let x = 0; x < pagesX; x++) {
        if (x > 0 || y > 0) {
          pdf.addPage();
        }
        
        // Create a view window for this page
        const viewX = x * availableWidth / scale;
        const viewY = y * availableHeight / scale;
        const viewWidth = availableWidth / scale;
        const viewHeight = availableHeight / scale;
        
        // Export this section
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = viewWidth;
        canvas.height = viewHeight;
        
        // This is a simplified approach - in practice, you'd need more sophisticated viewport handling
        const dataURL = await getPNGDataURL(element, {
          width: viewWidth,
          height: viewHeight
        });
        
        pdf.addImage(dataURL, 'PNG', margin, margin, availableWidth, availableHeight);
        
        // Add page number
        pdf.setFontSize(10);
        pdf.text(`Page ${y * pagesX + x + 1} of ${pagesX * pagesY}`, margin, margin - 5);
      }
    }
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Multi-page PDF export failed:', error);
    throw new Error(`Multi-page PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get PDF as blob
export async function getPDFBlob(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<Blob> {
  // Create a temporary PDF
  const pdf = createPDFDocument(options.format || 'a4', options.orientation || 'portrait', options);
  
  // Add content using the same logic as exportToPDF
  const margin = options.margin || 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const availableWidth = pageWidth - (margin * 2);
  const availableHeight = pageHeight - (margin * 2);

  try {
    await addSVGToPDF(pdf, element, {
      x: margin,
      y: margin,
      width: availableWidth,
      height: availableHeight,
      fitToPage: options.fitToPage || true,
      backgroundColor: options.backgroundColor || '#ffffff'
    });
  } catch {
    await addPNGToPDF(pdf, element, {
      x: margin,
      y: margin,
      width: availableWidth,
      height: availableHeight,
      fitToPage: options.fitToPage || true,
      backgroundColor: options.backgroundColor || '#ffffff',
      quality: options.quality || 1
    });
  }

  return pdf.output('blob');
}

// Validate element for PDF export
export function validateElementForPDFExport(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }

  // Check if element has content suitable for PDF export
  const hasSVG = element.querySelector('svg') !== null;
  const hasContent = element.offsetWidth > 0 && element.offsetHeight > 0;
  
  return hasSVG && hasContent;
}

// Get optimal PDF format for content
export function getOptimalPDFFormat(element: HTMLElement): {
  format: PDFExportOptions['format'];
  orientation: PDFExportOptions['orientation'];
} {
  const rect = element.getBoundingClientRect();
  const aspectRatio = rect.width / rect.height;
  
  if (aspectRatio > 1.4) {
    return { format: 'a4', orientation: 'landscape' };
  } else if (aspectRatio < 0.7) {
    return { format: 'a4', orientation: 'portrait' };
  } else {
    return { format: 'a4', orientation: 'landscape' };
  }
}