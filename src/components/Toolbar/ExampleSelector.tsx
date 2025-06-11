import React, { useState } from 'react';
import { useDiagram } from '../../hooks/useDiagram';
import { EXAMPLE_DIAGRAMS } from '../../constants/examples';

export function ExampleSelector() {
  const { updateContent, currentDiagram } = useDiagram();
  const [isOpen, setIsOpen] = useState(false);

  // Handle example selection
  const handleSelectExample = (exampleIndex: number) => {
    const example = EXAMPLE_DIAGRAMS[exampleIndex];
    if (!example) {
      console.error('[ExampleSelector] Example not found at index:', exampleIndex);
      return;
    }

    console.log('[ExampleSelector] Loading example:', example.type);

    // Warn if current diagram has content
    if (currentDiagram?.content?.trim() && 
        !confirm('Load example diagram? Current changes will be lost.')) {
      console.log('[ExampleSelector] Load cancelled by user');
      setIsOpen(false);
      return;
    }

    console.log('[ExampleSelector] Updating content with example:', example.example.substring(0, 100) + '...');
    updateContent(example.example);
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center"
        title="Load example diagram"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Examples
        <svg className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Choose an example to get started
              </div>
              
              {EXAMPLE_DIAGRAMS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectExample(index)}
                  className="block w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {example.type.charAt(0).toUpperCase() + example.type.slice(1)} Diagram
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {example.description}
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                      {example.type}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                      {example.syntax}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}