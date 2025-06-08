import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { useDiagram } from '../../hooks/useDiagram';
import { useMermaidTheme } from '../../hooks/useTheme';
import { useDebounce } from '../../hooks/useDebounce';
import { MermaidValidationResult } from '../../types/mermaid';
import { ErrorDisplay } from './ErrorDisplay';
import { PreviewControls } from './PreviewControls';

interface MermaidPreviewProps {
  className?: string;
  showControls?: boolean;
  onRenderComplete?: (svg: string) => void;
  onRenderError?: (error: Error) => void;
}

export function MermaidPreview({
  className = '',
  showControls = true,
  onRenderComplete,
  onRenderError
}: MermaidPreviewProps) {
  const { content, isValid, error, validationResult } = useDiagram();
  const { mermaidConfig } = useMermaidTheme();
  const debouncedContent = useDebounce(content, 500);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      ...mermaidConfig,
      startOnLoad: false,
      suppressErrorRendering: true,
      maxTextSize: 90000,
      maxEdges: 500
    });
  }, [mermaidConfig]);

  // Render diagram when content changes
  const renderDiagram = useCallback(async () => {
    if (!containerRef.current || !debouncedContent.trim() || !isMountedRef.current) {
      if (isMountedRef.current) {
        setRenderedSvg('');
        setRenderError(null);
      }
      return;
    }

    if (isMountedRef.current) {
      setIsRendering(true);
      setRenderError(null);
    }

    try {
      // Validate syntax first
      const isValidSyntax = await mermaid.parse(debouncedContent);
      if (!isValidSyntax) {
        throw new Error('Invalid Mermaid syntax');
      }

      // Generate unique ID for this render
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Clear the container
      containerRef.current.innerHTML = '';
      
      // Render the diagram
      const { svg } = await mermaid.render(diagramId, debouncedContent);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        setRenderedSvg(svg);
        
        // Apply initial transform
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.transformOrigin = 'center center';
          svgElement.style.transition = 'transform 0.2s ease';
        }
        
        if (onRenderComplete) {
          onRenderComplete(svg);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to render diagram';
      setRenderError(errorMessage);
      setRenderedSvg('');
      
      if (onRenderError && error instanceof Error) {
        onRenderError(error);
      }
      
      // Display error in container
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full text-red-500">
            <div class="text-center">
              <div class="text-xl mb-2">⚠️</div>
              <div class="text-sm">${errorMessage}</div>
            </div>
          </div>
        `;
      }
    } finally {
      if (isMountedRef.current) {
        setIsRendering(false);
      }
    }
  }, [debouncedContent, onRenderComplete, onRenderError]);

  // Re-render when debounced content changes
  useEffect(() => {
    renderDiagram();
  }, [debouncedContent]);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const svgElement = container.querySelector('svg');
    
    if (!svgElement) return;
    
    const containerRect = container.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();
    
    const scaleX = (containerRect.width - 40) / svgRect.width;
    const scaleY = (containerRect.height - 40) / svgRect.height;
    const newZoom = Math.min(scaleX, scaleY, 1);
    
    setZoom(newZoom);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  // Handle pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
      e.preventDefault();
    }
  }, [panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  // Apply transforms when zoom or pan changes
  useEffect(() => {
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.transform = `scale(${zoom}) translate(${panPosition.x / zoom}px, ${panPosition.y / zoom}px)`;
      }
    }
  }, [zoom, panPosition]);

  // Cleanup effect for proper container disposal
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      try {
        if (containerRef.current) {
          // Clear the container safely
          containerRef.current.innerHTML = '';
        }
      } catch (error) {
        console.debug('Mermaid cleanup error (ignored):', error);
      }
    };
  }, []);

  // Get current validation status
  const getValidationStatus = useCallback((): MermaidValidationResult => {
    if (renderError) {
      return {
        isValid: false,
        error: { message: renderError }
      };
    }
    
    if (validationResult) {
      return validationResult;
    }
    
    return {
      isValid: isValid,
      error: error ? { message: error } : undefined
    };
  }, [isValid, error, validationResult, renderError]);

  const currentValidation = getValidationStatus();

  return (
    <div className={`mermaid-preview-container ${className}`}>
      {showControls && (
        <PreviewControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFitToScreen={handleFitToScreen}
          isRendering={isRendering}
          canExport={!!renderedSvg && currentValidation.isValid}
        />
      )}
      
        <div 
          ref={containerRef}
          className={`mermaid-container ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            height: showControls ? 'calc(100% - 60px)' : '100%',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            minHeight: '300px'
          }}
        >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
            <div className="flex items-center space-x-2 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Rendering diagram...</span>
            </div>
          </div>
        )}
        
        {!debouncedContent.trim() && !isRendering && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div>Start typing Mermaid syntax to see the preview</div>
              <div className="text-sm mt-1">Example: flowchart TD</div>
            </div>
          </div>
        )}
        </div>
      
      {!currentValidation.isValid && currentValidation.error && (
        <ErrorDisplay 
          error={currentValidation.error.message}
          warnings={currentValidation.warnings}
        />
      )}
    </div>
  );
}