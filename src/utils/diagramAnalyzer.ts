export interface DiagramAnalysis {
  type: string;
  nodeCount: number;
  connectionCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  structure: DiagramStructure;
  suggestions: string[];
  metadata: DiagramMetadata;
}

export interface DiagramStructure {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  clusters?: string[];
  direction?: string;
}

export interface DiagramNode {
  id: string;
  label?: string;
  type: 'default' | 'decision' | 'process' | 'start' | 'end' | 'class' | 'participant';
  shape?: string;
  style?: string;
}

export interface DiagramConnection {
  from: string;
  to: string;
  type: 'arrow' | 'line' | 'dotted' | 'thick';
  label?: string;
}

export interface DiagramMetadata {
  hasComments: boolean;
  hasStyles: boolean;
  hasSubgraphs: boolean;
  lineCount: number;
  estimatedRenderTime: number;
}

// Main diagram analysis function
export function analyzeDiagram(diagram: string): DiagramAnalysis {
  if (!diagram.trim()) {
    return getEmptyAnalysis();
  }
  
  const lines = diagram.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const type = extractDiagramType(lines[0]);
  
  let analysis: DiagramAnalysis;
  
  switch (type) {
    case 'flowchart':
    case 'graph':
      analysis = analyzeFlowchart(lines);
      break;
    case 'sequenceDiagram':
      analysis = analyzeSequenceDiagram(lines);
      break;
    case 'classDiagram':
      analysis = analyzeClassDiagram(lines);
      break;
    case 'stateDiagram':
      analysis = analyzeStateDiagram(lines);
      break;
    default:
      analysis = analyzeGeneric(lines);
  }
  
  analysis.type = type;
  analysis.metadata = extractMetadata(lines);
  analysis.complexity = calculateComplexity(analysis);
  analysis.suggestions = generateAnalysisSuggestions(analysis);
  
  return analysis;
}

// Extract diagram type from first line
function extractDiagramType(firstLine: string): string {
  const typeMatch = firstLine.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|entityRelationshipDiagram|gantt|pie|journey|gitgraph|mindmap|timeline)/);
  return typeMatch ? typeMatch[1] : 'unknown';
}

// Analyze flowchart/graph diagrams
function analyzeFlowchart(lines: string[]): DiagramAnalysis {
  const nodes: DiagramNode[] = [];
  const connections: DiagramConnection[] = [];
  const nodeMap = new Map<string, DiagramNode>();
  
  let direction = 'TD'; // Default
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('%')) continue; // Skip comments
    
    // Extract direction
    const directionMatch = line.match(/^(TD|TB|BT|RL|LR)$/);
    if (directionMatch) {
      direction = directionMatch[1];
      continue;
    }
    
    // Extract node definitions
    const nodeMatch = line.match(/^\s*([A-Za-z0-9_-]+)(\[.*?\]|\(.*?\)|\{.*?\}|\(\(.*?\)\)|>.*?])/);
    if (nodeMatch) {
      const [, id, shapeContent] = nodeMatch;
      const shape = getShapeType(shapeContent);
      const label = extractLabel(shapeContent);
      
      const node: DiagramNode = {
        id,
        label,
        type: getNodeType(shape),
        shape
      };
      
      nodes.push(node);
      nodeMap.set(id, node);
      continue;
    }
    
    // Extract connections
    const connectionMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*(-->|---|\-\.->\|-\.\-\|o--o\|<==>)\s*([A-Za-z0-9_-]+)(\s*\|\s*(.+))?/);
    if (connectionMatch) {
      const [, from, arrow, to, , label] = connectionMatch;
      
      // Ensure nodes exist
      if (!nodeMap.has(from)) {
        const node: DiagramNode = { id: from, type: 'default' };
        nodes.push(node);
        nodeMap.set(from, node);
      }
      if (!nodeMap.has(to)) {
        const node: DiagramNode = { id: to, type: 'default' };
        nodes.push(node);
        nodeMap.set(to, node);
      }
      
      connections.push({
        from,
        to,
        type: getConnectionType(arrow),
        label: label?.trim()
      });
    }
  }
  
  return {
    type: 'flowchart',
    nodeCount: nodes.length,
    connectionCount: connections.length,
    complexity: 'simple',
    structure: {
      nodes,
      connections,
      direction
    },
    suggestions: [],
    metadata: {} as DiagramMetadata
  };
}

// Analyze sequence diagrams
function analyzeSequenceDiagram(lines: string[]): DiagramAnalysis {
  const nodes: DiagramNode[] = [];
  const connections: DiagramConnection[] = [];
  const participants = new Set<string>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('%')) continue;
    
    // Extract participant declarations
    const participantMatch = line.match(/^\s*participant\s+(.+?)(\s+as\s+(.+))?$/);
    if (participantMatch) {
      const [, id, , alias] = participantMatch;
      participants.add(id);
      nodes.push({
        id,
        label: alias || id,
        type: 'participant'
      });
      continue;
    }
    
    // Extract messages
    const messageMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*(->>?|-->>?)\s*([A-Za-z0-9_-]+)\s*:\s*(.+)/);
    if (messageMatch) {
      const [, from, arrow, to, label] = messageMatch;
      
      // Add participants if not explicitly declared
      [from, to].forEach(p => {
        if (!participants.has(p)) {
          participants.add(p);
          nodes.push({
            id: p,
            label: p,
            type: 'participant'
          });
        }
      });
      
      connections.push({
        from,
        to,
        type: arrow.includes('>>') ? 'arrow' : 'line',
        label: label.trim()
      });
    }
  }
  
  return {
    type: 'sequenceDiagram',
    nodeCount: nodes.length,
    connectionCount: connections.length,
    complexity: 'simple',
    structure: {
      nodes,
      connections
    },
    suggestions: [],
    metadata: {} as DiagramMetadata
  };
}

// Analyze class diagrams
function analyzeClassDiagram(lines: string[]): DiagramAnalysis {
  const nodes: DiagramNode[] = [];
  const connections: DiagramConnection[] = [];
  const classes = new Map<string, DiagramNode>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('%')) continue;
    
    // Extract class definitions
    const classMatch = line.match(/^\s*class\s+([A-Za-z0-9_-]+)/);
    if (classMatch) {
      const className = classMatch[1];
      const node: DiagramNode = {
        id: className,
        label: className,
        type: 'class'
      };
      nodes.push(node);
      classes.set(className, node);
      continue;
    }
    
    // Extract relationships
    const relationshipMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*(--|\.\.|\|\||<\|--|\*--|\)--|\}--|o--)\s*([A-Za-z0-9_-]+)/);
    if (relationshipMatch) {
      const [, from, connector, to] = relationshipMatch;
      
      // Ensure classes exist
      [from, to].forEach(className => {
        if (!classes.has(className)) {
          const node: DiagramNode = {
            id: className,
            label: className,
            type: 'class'
          };
          nodes.push(node);
          classes.set(className, node);
        }
      });
      
      connections.push({
        from,
        to,
        type: getClassConnectionType(connector)
      });
    }
  }
  
  return {
    type: 'classDiagram',
    nodeCount: nodes.length,
    connectionCount: connections.length,
    complexity: 'simple',
    structure: {
      nodes,
      connections
    },
    suggestions: [],
    metadata: {} as DiagramMetadata
  };
}

// Analyze state diagrams
function analyzeStateDiagram(lines: string[]): DiagramAnalysis {
  const nodes: DiagramNode[] = [];
  const connections: DiagramConnection[] = [];
  const states = new Map<string, DiagramNode>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('%')) continue;
    
    // Extract state transitions
    const transitionMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*-->\s*([A-Za-z0-9_-]+)(\s*:\s*(.+))?/);
    if (transitionMatch) {
      const [, from, to, , label] = transitionMatch;
      
      // Ensure states exist
      [from, to].forEach(stateName => {
        if (!states.has(stateName)) {
          const node: DiagramNode = {
            id: stateName,
            label: stateName,
            type: 'default'
          };
          nodes.push(node);
          states.set(stateName, node);
        }
      });
      
      connections.push({
        from,
        to,
        type: 'arrow',
        label: label?.trim()
      });
    }
  }
  
  return {
    type: 'stateDiagram',
    nodeCount: nodes.length,
    connectionCount: connections.length,
    complexity: 'simple',
    structure: {
      nodes,
      connections
    },
    suggestions: [],
    metadata: {} as DiagramMetadata
  };
}

// Generic analysis for unknown types
function analyzeGeneric(lines: string[]): DiagramAnalysis {
  return {
    type: 'unknown',
    nodeCount: 0,
    connectionCount: 0,
    complexity: 'simple',
    structure: {
      nodes: [],
      connections: []
    },
    suggestions: ['Unknown diagram type - consider using a supported type'],
    metadata: {} as DiagramMetadata
  };
}

// Extract metadata from diagram
function extractMetadata(lines: string[]): DiagramMetadata {
  const hasComments = lines.some(line => line.trim().startsWith('%'));
  const hasStyles = lines.some(line => line.includes('style') || line.includes('fill:') || line.includes('stroke:'));
  const hasSubgraphs = lines.some(line => line.includes('subgraph'));
  
  return {
    hasComments,
    hasStyles,
    hasSubgraphs,
    lineCount: lines.length,
    estimatedRenderTime: calculateRenderTime(lines.length)
  };
}

// Calculate complexity based on analysis
function calculateComplexity(analysis: DiagramAnalysis): 'simple' | 'moderate' | 'complex' {
  const totalElements = analysis.nodeCount + analysis.connectionCount;
  
  if (totalElements <= 5) return 'simple';
  if (totalElements <= 15) return 'moderate';
  return 'complex';
}

// Generate suggestions based on analysis
function generateAnalysisSuggestions(analysis: DiagramAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (analysis.nodeCount === 0) {
    suggestions.push('Add nodes to your diagram');
  } else if (analysis.nodeCount === 1) {
    suggestions.push('Consider adding more nodes');
  }
  
  if (analysis.connectionCount === 0 && analysis.nodeCount > 1) {
    suggestions.push('Add connections between nodes');
  }
  
  if (!analysis.metadata.hasStyles && analysis.nodeCount > 3) {
    suggestions.push('Consider adding colors and styling');
  }
  
  if (!analysis.metadata.hasComments && analysis.complexity === 'complex') {
    suggestions.push('Add comments to document complex parts');
  }
  
  if (analysis.complexity === 'complex') {
    suggestions.push('Consider breaking into smaller diagrams');
  }
  
  return suggestions;
}

// Helper functions
function getShapeType(shapeContent: string): string {
  if (shapeContent.startsWith('[')) return 'rectangle';
  if (shapeContent.startsWith('(')) return shapeContent.startsWith('((') ? 'circle' : 'rounded';
  if (shapeContent.startsWith('{')) return 'rhombus';
  if (shapeContent.startsWith('>')) return 'flag';
  return 'rectangle';
}

function extractLabel(shapeContent: string): string {
  return shapeContent.replace(/^[\[\(\{>]+|[\]\)\}>]+$/g, '').trim();
}

function getNodeType(shape: string): DiagramNode['type'] {
  switch (shape) {
    case 'rhombus': return 'decision';
    case 'circle': return 'start';
    case 'rectangle': return 'process';
    default: return 'default';
  }
}

function getConnectionType(arrow: string): DiagramConnection['type'] {
  if (arrow.includes('-.')) return 'dotted';
  if (arrow.includes('=')) return 'thick';
  if (arrow.includes('>')) return 'arrow';
  return 'line';
}

function getClassConnectionType(connector: string): DiagramConnection['type'] {
  return 'line'; // Simplified for now
}

function calculateRenderTime(lineCount: number): number {
  // Rough estimate in milliseconds
  return Math.max(100, lineCount * 10);
}

function getEmptyAnalysis(): DiagramAnalysis {
  return {
    type: 'empty',
    nodeCount: 0,
    connectionCount: 0,
    complexity: 'simple',
    structure: {
      nodes: [],
      connections: []
    },
    suggestions: ['Start by adding a diagram type (e.g., flowchart TD)'],
    metadata: {
      hasComments: false,
      hasStyles: false,
      hasSubgraphs: false,
      lineCount: 0,
      estimatedRenderTime: 0
    }
  };
}

// Get quick stats for UI display
export function getQuickStats(diagram: string): { nodes: number; connections: number; type: string } {
  const analysis = analyzeDiagram(diagram);
  return {
    nodes: analysis.nodeCount,
    connections: analysis.connectionCount,
    type: analysis.type
  };
}

// Check if diagram has certain features
export function hasFeature(diagram: string, feature: 'styles' | 'comments' | 'subgraphs'): boolean {
  const analysis = analyzeDiagram(diagram);
  switch (feature) {
    case 'styles': return analysis.metadata.hasStyles;
    case 'comments': return analysis.metadata.hasComments;
    case 'subgraphs': return analysis.metadata.hasSubgraphs;
    default: return false;
  }
}