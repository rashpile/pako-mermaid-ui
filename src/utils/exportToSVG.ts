export interface SVGExportOptions {
  filename?: string;
  includeStyles?: boolean;
  width?: number;
  height?: number;
  backgroundColor?: string;
  preserveAspectRatio?: string;
}

export async function exportToSVG(
  element: HTMLElement,
  options: SVGExportOptions = {}
): Promise<void> {
  const {
    filename = 'mermaid-diagram',
    includeStyles = true,
    backgroundColor = 'transparent',
    preserveAspectRatio = 'xMidYMid meet'
  } = options;

  try {
    // Find the SVG element
    const svgElement = element.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in the provided element');
    }

    // Clone the SVG to avoid modifying the original
    const clonedSVG = svgElement.cloneNode(true) as SVGElement;
    
    // Set dimensions if provided
    if (options.width) {
      clonedSVG.setAttribute('width', options.width.toString());
    }
    if (options.height) {
      clonedSVG.setAttribute('height', options.height.toString());
    }

    // Set background color
    if (backgroundColor !== 'transparent') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', backgroundColor);
      clonedSVG.insertBefore(rect, clonedSVG.firstChild);
    }

    // Set preserveAspectRatio
    clonedSVG.setAttribute('preserveAspectRatio', preserveAspectRatio);

    // Include styles if requested
    if (includeStyles) {
      await inlineStyles(clonedSVG);
    }

    // Convert to string
    const svgString = new XMLSerializer().serializeToString(clonedSVG);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${filename}.svg`);
  } catch (error) {
    console.error('SVG export failed:', error);
    throw new Error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export SVG with custom dimensions
export async function exportToSVGWithDimensions(
  element: HTMLElement,
  width: number,
  height: number,
  options: Omit<SVGExportOptions, 'width' | 'height'> = {}
): Promise<void> {
  return exportToSVG(element, { ...options, width, height });
}

// Get SVG as string for further processing
export async function getSVGString(
  element: HTMLElement,
  options: SVGExportOptions = {}
): Promise<string> {
  const {
    includeStyles = true,
    backgroundColor = 'transparent',
    preserveAspectRatio = 'xMidYMid meet'
  } = options;

  try {
    const svgElement = element.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in the provided element');
    }

    const clonedSVG = svgElement.cloneNode(true) as SVGElement;
    
    if (options.width) {
      clonedSVG.setAttribute('width', options.width.toString());
    }
    if (options.height) {
      clonedSVG.setAttribute('height', options.height.toString());
    }

    if (backgroundColor !== 'transparent') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', backgroundColor);
      clonedSVG.insertBefore(rect, clonedSVG.firstChild);
    }

    clonedSVG.setAttribute('preserveAspectRatio', preserveAspectRatio);

    if (includeStyles) {
      await inlineStyles(clonedSVG);
    }

    return new XMLSerializer().serializeToString(clonedSVG);
  } catch (error) {
    console.error('SVG string generation failed:', error);
    throw new Error(`SVG string generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get SVG as blob
export async function getSVGBlob(
  element: HTMLElement,
  options: SVGExportOptions = {}
): Promise<Blob> {
  const svgString = await getSVGString(element, options);
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

// Get SVG as data URL
export async function getSVGDataURL(
  element: HTMLElement,
  options: SVGExportOptions = {}
): Promise<string> {
  const svgString = await getSVGString(element, options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to create SVG data URL'));
    reader.readAsDataURL(blob);
  });
}

// Inline styles for standalone SVG
async function inlineStyles(svgElement: SVGElement): Promise<void> {
  try {
    // Get all computed styles
    const allElements = svgElement.querySelectorAll('*');
    
    for (const element of Array.from(allElements)) {
      const computedStyle = window.getComputedStyle(element);
      const inlineStyle: string[] = [];
      
      // Important style properties for SVG
      const importantProperties = [
        'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
        'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight',
        'font-style', 'text-anchor', 'dominant-baseline', 'alignment-baseline',
        'color', 'visibility', 'display'
      ];
      
      for (const property of importantProperties) {
        const value = computedStyle.getPropertyValue(property);
        if (value && value !== 'initial' && value !== 'inherit') {
          inlineStyle.push(`${property}: ${value}`);
        }
      }
      
      if (inlineStyle.length > 0) {
        element.setAttribute('style', inlineStyle.join('; '));
      }
    }

    // Add font definitions if any fonts are used
    await addFontDefinitions(svgElement);
  } catch (error) {
    console.warn('Failed to inline styles:', error);
  }
}

// Add font definitions to SVG
async function addFontDefinitions(svgElement: SVGElement): Promise<void> {
  try {
    const usedFonts = new Set<string>();
    const allElements = svgElement.querySelectorAll('*');
    
    // Collect used fonts
    for (const element of Array.from(allElements)) {
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.getPropertyValue('font-family');
      if (fontFamily && fontFamily !== 'initial') {
        usedFonts.add(fontFamily);
      }
    }
    
    if (usedFonts.size === 0) return;
    
    // Create defs element for font definitions
    let defsElement = svgElement.querySelector('defs');
    if (!defsElement) {
      defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svgElement.insertBefore(defsElement, svgElement.firstChild);
    }
    
    // Add style element with font-face rules
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.setAttribute('type', 'text/css');
    
    let cssContent = '';
    for (const font of usedFonts) {
      // Add basic font fallbacks
      cssContent += `
        text { font-family: ${font}, Arial, sans-serif; }
      `;
    }
    
    styleElement.textContent = cssContent;
    defsElement.appendChild(styleElement);
  } catch (error) {
    console.warn('Failed to add font definitions:', error);
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
  
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Validate element for SVG export
export function validateElementForSVGExport(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }

  const svgElement = element.querySelector('svg');
  if (!svgElement) {
    return false;
  }

  // Check if SVG has content
  return svgElement.children.length > 0 || svgElement.textContent?.trim().length > 0;
}

// Get SVG dimensions
export function getSVGDimensions(element: HTMLElement): { width: number; height: number } | null {
  const svgElement = element.querySelector('svg');
  if (!svgElement) {
    return null;
  }

  const viewBox = svgElement.getAttribute('viewBox');
  if (viewBox) {
    const [, , width, height] = viewBox.split(' ').map(Number);
    return { width, height };
  }

  const width = svgElement.getAttribute('width');
  const height = svgElement.getAttribute('height');
  
  if (width && height) {
    return {
      width: parseFloat(width),
      height: parseFloat(height)
    };
  }

  // Fallback to bounding box
  const bbox = svgElement.getBBox();
  return {
    width: bbox.width,
    height: bbox.height
  };
}

// Optimize SVG for export
export function optimizeSVGForExport(svgString: string): string {
  return svgString
    // Remove unnecessary attributes
    .replace(/\s*xmlns:xlink="[^"]*"/g, '')
    .replace(/\s*xml:space="[^"]*"/g, '')
    // Clean up whitespace
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}