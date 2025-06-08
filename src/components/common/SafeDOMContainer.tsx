import { useEffect, useRef, ReactNode } from 'react';

interface SafeDOMContainerProps {
  children?: ReactNode;
  className?: string;
  onMount?: (element: HTMLDivElement) => void;
  onUnmount?: (element: HTMLDivElement) => void;
}

/**
 * A safe container that prevents React fiber errors when child components
 * manipulate the DOM directly (like Monaco Editor and Mermaid)
 */
export function SafeDOMContainer({ 
  children, 
  className = '', 
  onMount, 
  onUnmount 
}: SafeDOMContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container && onMount) {
      onMount(container);
    }

    return () => {
      isUnmountingRef.current = true;
      
      // Give React a chance to finish its cleanup first
      setTimeout(() => {
        try {
          if (container && onUnmount) {
            onUnmount(container);
          }
        } catch (error) {
          // Silently handle cleanup errors
          console.debug('SafeDOMContainer cleanup error (ignored):', error);
        }
      }, 0);
    };
  }, [onMount, onUnmount]);

  // Prevent React from trying to manage children if we're unmounting
  const safeChildren = isUnmountingRef.current ? null : children;

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ position: 'relative' }}
    >
      {safeChildren}
    </div>
  );
}