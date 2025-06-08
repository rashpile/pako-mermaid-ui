import html2canvas from 'html2canvas';

export interface PNGExportOptions {
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  filename?: string;
}

export async function exportToPNG(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<void> {
  const {
    quality = 1,
    scale = 2,
    backgroundColor = '#ffffff',
    filename = 'mermaid-diagram'
  } = options;

  try {
    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      removeContainer: true,
      logging: false,
      width: options.width,
      height: options.height,
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded in cloned document
        const clonedElement = clonedDoc.querySelector('[data-mermaid-element]') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.fontFamily = 'Arial, sans-serif';
        }
      }
    });

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        quality
      );
    });

    // Download the image
    downloadBlob(blob, `${filename}.png`);
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error(`PNG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export PNG with custom dimensions
export async function exportToPNGWithDimensions(
  element: HTMLElement,
  width: number,
  height: number,
  options: Omit<PNGExportOptions, 'width' | 'height'> = {}
): Promise<void> {
  return exportToPNG(element, { ...options, width, height });
}

// Export PNG with high quality settings
export async function exportToHighQualityPNG(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<void> {
  return exportToPNG(element, {
    ...options,
    quality: 1,
    scale: 3,
    backgroundColor: '#ffffff'
  });
}

// Get PNG as data URL for preview
export async function getPNGDataURL(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<string> {
  const {
    quality = 1,
    scale = 2,
    backgroundColor = '#ffffff'
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: true,
      logging: false,
      width: options.width,
      height: options.height
    });

    return canvas.toDataURL('image/png', quality);
  } catch (error) {
    console.error('PNG data URL generation failed:', error);
    throw new Error(`PNG data URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get PNG as blob for further processing
export async function getPNGBlob(
  element: HTMLElement,
  options: PNGExportOptions = {}
): Promise<Blob> {
  const {
    quality = 1,
    scale = 2,
    backgroundColor = '#ffffff'
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: true,
      logging: false,
      width: options.width,
      height: options.height
    });

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        quality
      );
    });
  } catch (error) {
    console.error('PNG blob generation failed:', error);
    throw new Error(`PNG blob generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to download blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Validate element for export
export function validateElementForPNGExport(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }

  // Check if element has content
  const hasContent = element.offsetWidth > 0 && element.offsetHeight > 0;
  if (!hasContent) {
    return false;
  }

  // Check if element contains SVG or Mermaid content
  const hasSVG = element.querySelector('svg') !== null;
  const hasMermaidContent = element.textContent && element.textContent.trim().length > 0;
  
  return hasSVG || hasMermaidContent;
}

// Get optimal export dimensions
export function getOptimalExportDimensions(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  const svg = element.querySelector('svg');
  
  if (svg) {
    const svgRect = svg.getBoundingClientRect();
    return {
      width: Math.max(svgRect.width, 800),
      height: Math.max(svgRect.height, 600)
    };
  }
  
  return {
    width: Math.max(rect.width, 800),
    height: Math.max(rect.height, 600)
  };
}