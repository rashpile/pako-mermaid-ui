import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { useDiagramStore } from '../../store/diagramStore';
import { MermaidValidationResult } from '../../types/mermaid';
import { ErrorDisplay } from './ErrorDisplay';
import { PreviewControls } from './PreviewControls';

interface MermaidPreviewProps {
  className?: string;
  showControls?: boolean;
  onRenderComplete?: (svg: string) => void;
  onRenderError?: (error: Error) => void;
  onUpdateAvailable?: (updatePreview: () => void) => void;
}

function MermaidPreviewComponent({
  className = '',
  showControls = true,
  onRenderComplete,
  onRenderError,
  onUpdateAvailable
}: MermaidPreviewProps) {
  console.log('[MermaidPreview] Component rendering');
  
  // Use minimal store access to avoid infinite re-renders
  const editorState = useDiagramStore(state => state.editorState);
  const content = editorState.content;
  const isValid = true;
  const error = undefined;
  const validationResult = null;
  
  // Track the last rendered content to avoid unnecessary re-renders
  const [lastRenderedContent, setLastRenderedContent] = useState('');
  const [renderVersion, setRenderVersion] = useState(0); // Force render trigger
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Manual update function - now forces a render even with same content
  const updatePreview = useCallback(() => {
    console.log('[MermaidPreview] Manual update triggered');
    // Increment version to force a re-render
    setRenderVersion(v => v + 1);
  }, []);
  
  // Check if content has changed since last render
  const hasContentChanged = content !== lastRenderedContent;
  
  // Expose update function to parent
  useEffect(() => {
    if (onUpdateAvailable) {
      onUpdateAvailable(updatePreview);
    }
  }, [onUpdateAvailable, updatePreview]);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
      maxTextSize: 90000,
      maxEdges: 500,
      securityLevel: 'loose',
      theme: 'default'
    });
  }, []);

  // Render diagram when content changes OR when manually triggered
  useEffect(() => {
    console.log('[MermaidPreview] Render effect triggered');
    console.log('[MermaidPreview] Content:', content?.slice(0, 50) + '...');
    console.log('[MermaidPreview] Last rendered:', lastRenderedContent?.slice(0, 50) + '...');
    console.log('[MermaidPreview] Render version:', renderVersion);
    
    const renderDiagram = async () => {
      // Skip if no content
      if (!content?.trim()) {
        console.log('[MermaidPreview] No content to render');
        setRenderedSvg('');
        setRenderError(null);
        setLastRenderedContent('');
        return;
      }

      // Skip if content hasn't changed and this isn't a forced update
      if (content === lastRenderedContent && renderVersion === 0) {
        console.log('[MermaidPreview] Content unchanged, skipping render');
        return;
      }

      console.log('[MermaidPreview] Starting renderDiagram');
      setIsRendering(true);
      setRenderError(null);

      try {
        // Validate syntax first
        console.log('[MermaidPreview] Validating mermaid syntax...');
        const isValidSyntax = await mermaid.parse(content);
        console.log('[MermaidPreview] Syntax validation result:', isValidSyntax);
        if (!isValidSyntax) {
          throw new Error('Invalid Mermaid syntax');
        }

        // Generate unique ID for this render
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        console.log('[MermaidPreview] Generated diagram ID:', diagramId);
        
        // Create a temporary container for mermaid to render into
        const tempContainer = document.createElement('div');
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        try {
          // Render the diagram into the temporary container
          console.log('[MermaidPreview] Calling mermaid.render...');
          const { svg } = await mermaid.render(diagramId, content, tempContainer);
          console.log('[MermaidPreview] Mermaid render completed, svg length:', svg?.length);
          
          // Store the SVG
          setRenderedSvg(svg);
          setLastRenderedContent(content);
          
          if (onRenderComplete) {
            onRenderComplete(svg);
          }
        } finally {
          // Clean up temporary container
          document.body.removeChild(tempContainer);
        }
      } catch (error) {
        console.log('[MermaidPreview] Error during render:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to render diagram';
        setRenderError(errorMessage);
        setRenderedSvg('');
        setLastRenderedContent(''); // Reset so next attempt will try again
        
        if (onRenderError && error instanceof Error) {
          onRenderError(error);
        }
      } finally {
        console.log('[MermaidPreview] Setting isRendering to false');
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [content, renderVersion, onRenderComplete, onRenderError]); // Include renderVersion in dependencies

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
        
        {renderedSvg && !isRendering && (
          <div 
            className="mermaid-svg-container"
            dangerouslySetInnerHTML={{ __html: renderedSvg }}
            style={{
              transform: `scale(${zoom}) translate(${panPosition.x / zoom}px, ${panPosition.y / zoom}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}
        
        {!content?.trim() && !isRendering && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div>Start typing Mermaid syntax to see the preview</div>
              <div className="text-sm mt-1">Example: flowchart TD</div>
            </div>
          </div>
        )}
        
        {renderError && !isRendering && (
          <div className="flex items-center justify-center h-full text-red-500">
            <div className="text-center">
              <div className="text-xl mb-2">⚠️</div>
              <div className="text-sm">{renderError}</div>
            </div>
          </div>
        )}
      </div>
      
      {!currentValidation.isValid && currentValidation.error && !renderError && (
        <ErrorDisplay 
          error={currentValidation.error.message}
          warnings={currentValidation.warnings}
        />
      )}
    </div>
  );
}

export const MermaidPreview = MermaidPreviewComponent;