import React from 'react';
import { DiagramData } from '../../types';

interface DiagramListProps {
  diagrams: DiagramData[];
  selectedDiagram: DiagramData | null;
  onSelect: (diagram: DiagramData) => void;
  onLoad: (diagram: DiagramData) => void;
  onDelete: (diagram: DiagramData) => void;
  isLoading?: boolean;
}

export function DiagramList({
  diagrams,
  selectedDiagram,
  onSelect,
  onLoad,
  onDelete,
  isLoading = false
}: DiagramListProps) {
  // Get diagram type from content
  const getDiagramType = (content: string): string => {
    const firstLine = content.split('\n')[0].trim();
    const typeMatch = firstLine.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|entityRelationshipDiagram|gantt|pie|journey|gitgraph|mindmap|timeline)/);
    return typeMatch ? typeMatch[1] : 'unknown';
  };

  // Get diagram type display info
  const getDiagramTypeInfo = (type: string) => {
    const typeMap: Record<string, { label: string; color: string; icon: string }> = {
      flowchart: { label: 'Flowchart', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: '→' },
      graph: { label: 'Graph', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: '→' },
      sequenceDiagram: { label: 'Sequence', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: '⟷' },
      classDiagram: { label: 'Class', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', icon: '▢' },
      stateDiagram: { label: 'State', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400', icon: '◯' },
      entityRelationshipDiagram: { label: 'ER', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: '⧈' },
      gantt: { label: 'Gantt', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400', icon: '■' },
      pie: { label: 'Pie', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400', icon: '●' },
      journey: { label: 'Journey', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', icon: '⤴' },
      gitgraph: { label: 'Git', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400', icon: '⊕' },
      mindmap: { label: 'Mindmap', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '☊' },
      timeline: { label: 'Timeline', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400', icon: '⟶' },
      unknown: { label: 'Unknown', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400', icon: '?' }
    };
    return typeMap[type] || typeMap.unknown;
  };

  // Format date
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get content preview
  const getContentPreview = (content: string): string => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length <= 1) return 'Empty diagram';
    
    // Skip the first line (diagram type) and get next few meaningful lines
    const meaningfulLines = lines.slice(1).filter(line => 
      !line.trim().startsWith('%') && line.trim().length > 0
    ).slice(0, 3);
    
    return meaningfulLines.join(' | ') || 'No content preview';
  };

  return (
    <div className="space-y-2">
      {diagrams.map((diagram) => {
        const isSelected = selectedDiagram?.id === diagram.id;
        const diagramType = getDiagramType(diagram.content);
        const typeInfo = getDiagramTypeInfo(diagramType);

        return (
          <div
            key={diagram.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => onSelect(diagram)}
            onDoubleClick={() => onLoad(diagram)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {diagram.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                    <span className="mr-1">{typeInfo.icon}</span>
                    {typeInfo.label}
                  </span>
                </div>

                {/* Description */}
                {diagram.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {diagram.description}
                  </p>
                )}

                {/* Content preview */}
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 line-clamp-1 font-mono">
                  {getContentPreview(diagram.content)}
                </p>

                {/* Metadata */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                  <span>Lines: {diagram.content.split('\n').length}</span>
                  <span>•</span>
                  <span>Modified: {formatDate(diagram.lastModified)}</span>
                  {diagram.created && (
                    <>
                      <span>•</span>
                      <span>Created: {formatDate(diagram.created)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoad(diagram);
                  }}
                  disabled={isLoading}
                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded disabled:opacity-50"
                  title="Load diagram"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(diagram);
                  }}
                  disabled={isLoading}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded disabled:opacity-50"
                  title="Delete diagram"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}