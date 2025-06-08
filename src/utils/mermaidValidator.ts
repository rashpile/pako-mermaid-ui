export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  type: 'syntax' | 'semantic' | 'unknown';
}

export interface ValidationWarning {
  line?: number;
  column?: number;
  message: string;
  type: 'performance' | 'style' | 'accessibility';
}

// Basic Mermaid syntax validation
export function validateMermaidSyntax(diagram: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];
  
  if (!diagram.trim()) {
    return {
      isValid: false,
      errors: [{ message: 'Diagram is empty', type: 'semantic' }],
      warnings: [],
      suggestions: ['Add a diagram type (e.g., flowchart, graph, sequenceDiagram)']
    };
  }
  
  const lines = diagram.split('\n');
  let diagramType = '';
  
  // Check for diagram type declaration
  const firstLine = lines[0].trim();
  const validTypes = [
    'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'entityRelationshipDiagram', 'gantt', 'pie', 'journey', 'gitgraph',
    'mindmap', 'timeline', 'C4Context', 'C4Container', 'C4Component', 'C4Dynamic'
  ];
  
  let foundType = false;
  for (const type of validTypes) {
    if (firstLine.startsWith(type)) {
      diagramType = type;
      foundType = true;
      break;
    }
  }
  
  if (!foundType) {
    errors.push({
      line: 1,
      message: `Invalid or missing diagram type. Expected one of: ${validTypes.join(', ')}`,
      type: 'syntax'
    });
  }
  
  // Type-specific validation
  switch (diagramType) {
    case 'flowchart':
    case 'graph':
      validateFlowchart(lines, errors, warnings, suggestions);
      break;
    case 'sequenceDiagram':
      validateSequenceDiagram(lines, errors, warnings, suggestions);
      break;
    case 'classDiagram':
      validateClassDiagram(lines, errors, warnings, suggestions);
      break;
    case 'stateDiagram':
      validateStateDiagram(lines, errors, warnings, suggestions);
      break;
    default:
      // Generic validation for other types
      validateGeneric(lines, errors, warnings, suggestions);
  }
  
  // General syntax checks
  validateGeneral(lines, errors, warnings, suggestions);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

// Validate flowchart/graph diagrams
function validateFlowchart(
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  const nodes = new Set<string>();
  const connections = new Set<string>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%')) continue;
    
    // Check for node definitions
    const nodeMatch = line.match(/^\s*([A-Za-z0-9_-]+)(\[.*?\]|\(.*?\)|\{.*?\}|\(\(.*?\)\)|>.*?])/);
    if (nodeMatch) {
      nodes.add(nodeMatch[1]);
      continue;
    }
    
    // Check for connections
    const connectionMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*(-->|---|\-\.->\|-\.\-\|)\s*([A-Za-z0-9_-]+)/);
    if (connectionMatch) {
      const [, from, arrow, to] = connectionMatch;
      nodes.add(from);
      nodes.add(to);
      connections.add(`${from}${arrow}${to}`);
      continue;
    }
    
    // Check for direction
    if (line.match(/^\s*(TD|TB|BT|RL|LR)$/)) {
      continue;
    }
    
    // If we get here, it might be an invalid line
    if (line.length > 0) {
      warnings.push({
        line: i + 1,
        message: `Potentially invalid syntax: "${line}"`,
        type: 'style'
      });
    }
  }
  
  if (nodes.size === 0) {
    errors.push({
      message: 'No nodes found in flowchart',
      type: 'semantic'
    });
  } else if (nodes.size === 1) {
    warnings.push({
      message: 'Flowchart has only one node - consider adding connections',
      type: 'style'
    });
  }
  
  if (connections.size === 0 && nodes.size > 1) {
    suggestions.push('Add connections between nodes using arrows (-->)');
  }
}

// Validate sequence diagrams
function validateSequenceDiagram(
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  const participants = new Set<string>();
  let hasMessages = false;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%')) continue;
    
    // Check for participant declarations
    if (line.startsWith('participant ')) {
      const participant = line.replace('participant ', '').trim();
      participants.add(participant);
      continue;
    }
    
    // Check for messages
    const messageMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*(->>?|-->>?)\s*([A-Za-z0-9_-]+)\s*:\s*(.+)/);
    if (messageMatch) {
      const [, from, arrow, to] = messageMatch;
      participants.add(from);
      participants.add(to);
      hasMessages = true;
      continue;
    }
    
    // Check for activation/deactivation
    if (line.match(/^\s*(activate|deactivate)\s+[A-Za-z0-9_-]+$/)) {
      continue;
    }
    
    // Check for notes
    if (line.match(/^\s*note\s+(left|right|over)\s+[A-Za-z0-9_-]+/)) {
      continue;
    }
  }
  
  if (participants.size === 0) {
    errors.push({
      message: 'No participants found in sequence diagram',
      type: 'semantic'
    });
  }
  
  if (!hasMessages && participants.size > 0) {
    warnings.push({
      message: 'No messages found between participants',
      type: 'style'
    });
    suggestions.push('Add messages between participants using arrows (->>, ->>)');
  }
}

// Validate class diagrams
function validateClassDiagram(
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  const classes = new Set<string>();
  let hasRelationships = false;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%')) continue;
    
    // Check for class definitions
    if (line.startsWith('class ')) {
      const className = line.split(' ')[1];
      if (className) {
        classes.add(className);
      }
      continue;
    }
    
    // Check for relationships
    const relationshipMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*(--|\.\.|\|\|)\s*([A-Za-z0-9_-]+)/);
    if (relationshipMatch) {
      const [, from, , to] = relationshipMatch;
      classes.add(from);
      classes.add(to);
      hasRelationships = true;
      continue;
    }
  }
  
  if (classes.size === 0) {
    errors.push({
      message: 'No classes found in class diagram',
      type: 'semantic'
    });
  }
  
  if (!hasRelationships && classes.size > 1) {
    suggestions.push('Add relationships between classes using connectors (--, .., ||)');
  }
}

// Validate state diagrams
function validateStateDiagram(
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  const states = new Set<string>();
  let hasTransitions = false;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%')) continue;
    
    // Check for state transitions
    const transitionMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*-->\s*([A-Za-z0-9_-]+)/);
    if (transitionMatch) {
      const [, from, to] = transitionMatch;
      states.add(from);
      states.add(to);
      hasTransitions = true;
      continue;
    }
    
    // Check for state definitions
    if (line.includes(':')) {
      const stateName = line.split(':')[0].trim();
      if (stateName) {
        states.add(stateName);
      }
    }
  }
  
  if (states.size === 0) {
    errors.push({
      message: 'No states found in state diagram',
      type: 'semantic'
    });
  }
  
  if (!hasTransitions && states.size > 1) {
    suggestions.push('Add transitions between states using arrows (-->)');
  }
}

// Generic validation for other diagram types
function validateGeneric(
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  // Basic content check
  const contentLines = lines.slice(1).filter(line => line.trim() && !line.trim().startsWith('%'));
  
  if (contentLines.length === 0) {
    warnings.push({
      message: 'Diagram appears to be empty',
      type: 'style'
    });
    suggestions.push('Add content to your diagram');
  }
}

// General syntax validation
function validateGeneral(
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for unbalanced brackets
    const brackets = ['[]', '()', '{}'];
    for (const [open, close] of brackets.map(b => [b[0], b[1]])) {
      const openCount = (line.match(new RegExp(`\\${open}`, 'g')) || []).length;
      const closeCount = (line.match(new RegExp(`\\${close}`, 'g')) || []).length;
      
      if (openCount !== closeCount) {
        errors.push({
          line: i + 1,
          message: `Unbalanced ${open}${close} brackets`,
          type: 'syntax'
        });
      }
    }
    
    // Check for very long lines
    if (line.length > 200) {
      warnings.push({
        line: i + 1,
        message: 'Very long line - consider breaking it up for readability',
        type: 'style'
      });
    }
  }
}

// Quick validation for real-time feedback
export function quickValidate(diagram: string): boolean {
  if (!diagram.trim()) return false;
  
  const firstLine = diagram.split('\n')[0].trim();
  const validTypes = [
    'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'entityRelationshipDiagram', 'gantt', 'pie', 'journey', 'gitgraph'
  ];
  
  return validTypes.some(type => firstLine.startsWith(type));
}

// Get validation status for UI
export function getValidationStatus(result: ValidationResult): 'valid' | 'warning' | 'error' {
  if (result.errors.length > 0) return 'error';
  if (result.warnings.length > 0) return 'warning';
  return 'valid';
}