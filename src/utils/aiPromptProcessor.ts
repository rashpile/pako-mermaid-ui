import { DiagramUpdate } from '../types/chat';
import { SYSTEM_PROMPTS } from '../prompts/systemPrompts';

export interface ProcessedPrompt {
  intent: 'create' | 'modify' | 'explain' | 'help' | 'export' | 'unknown';
  confidence: number;
  suggestedDiagram?: string;
  explanation?: string;
  requirements?: string[];
}

// Extract diagram type from user input
export function extractDiagramType(prompt: string): string {
  const types = [
    'flowchart', 'graph', 'sequence', 'class', 'state', 'entity',
    'gantt', 'pie', 'journey', 'gitgraph', 'mindmap', 'timeline'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  for (const type of types) {
    if (lowerPrompt.includes(type)) {
      return type;
    }
  }
  
  // Default fallbacks based on keywords
  if (lowerPrompt.includes('flow') || lowerPrompt.includes('process') || lowerPrompt.includes('workflow')) {
    return 'flowchart';
  }
  if (lowerPrompt.includes('class') || lowerPrompt.includes('object') || lowerPrompt.includes('inheritance')) {
    return 'classDiagram';
  }
  if (lowerPrompt.includes('sequence') || lowerPrompt.includes('interaction') || lowerPrompt.includes('message')) {
    return 'sequenceDiagram';
  }
  if (lowerPrompt.includes('state') || lowerPrompt.includes('transition')) {
    return 'stateDiagram';
  }
  
  return 'flowchart'; // Default
}

// Analyze user intent from prompt
export function analyzeIntent(prompt: string, currentDiagram: string): ProcessedPrompt {
  const lowerPrompt = prompt.toLowerCase();
  
  // Create intent
  if (lowerPrompt.includes('create') || lowerPrompt.includes('make') || lowerPrompt.includes('build') || 
      lowerPrompt.includes('generate') || (!currentDiagram.trim() && lowerPrompt.includes('diagram'))) {
    return {
      intent: 'create',
      confidence: 0.9,
      requirements: extractRequirements(prompt)
    };
  }
  
  // Modify intent
  if (lowerPrompt.includes('add') || lowerPrompt.includes('remove') || lowerPrompt.includes('change') ||
      lowerPrompt.includes('update') || lowerPrompt.includes('modify') || lowerPrompt.includes('edit') ||
      lowerPrompt.includes('delete') || currentDiagram.trim()) {
    return {
      intent: 'modify',
      confidence: 0.8,
      requirements: extractRequirements(prompt)
    };
  }
  
  // Explain intent
  if (lowerPrompt.includes('explain') || lowerPrompt.includes('what') || lowerPrompt.includes('how') ||
      lowerPrompt.includes('why') || lowerPrompt.includes('describe')) {
    return {
      intent: 'explain',
      confidence: 0.7
    };
  }
  
  // Help intent
  if (lowerPrompt.includes('help') || lowerPrompt.includes('how to') || lowerPrompt.includes('tutorial') ||
      lowerPrompt.includes('guide') || lowerPrompt.includes('example')) {
    return {
      intent: 'help',
      confidence: 0.8
    };
  }
  
  // Export intent
  if (lowerPrompt.includes('export') || lowerPrompt.includes('download') || lowerPrompt.includes('save as') ||
      lowerPrompt.includes('pdf') || lowerPrompt.includes('png') || lowerPrompt.includes('svg')) {
    return {
      intent: 'export',
      confidence: 0.9
    };
  }
  
  return {
    intent: 'unknown',
    confidence: 0.1
  };
}

// Extract specific requirements from user prompt
export function extractRequirements(prompt: string): string[] {
  const requirements: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract entities/nodes
  const nodeMatches = prompt.match(/(?:node|box|step|element|component|entity)\s+(?:called\s+)?["']?(\w+)["']?/gi);
  if (nodeMatches) {
    nodeMatches.forEach(match => {
      const name = match.replace(/.*["']?(\w+)["']?.*/, '$1');
      requirements.push(`node: ${name}`);
    });
  }
  
  // Extract connections
  if (lowerPrompt.includes('connect') || lowerPrompt.includes('link') || lowerPrompt.includes('arrow')) {
    requirements.push('connections: true');
  }
  
  // Extract styling preferences
  if (lowerPrompt.includes('color') || lowerPrompt.includes('style') || lowerPrompt.includes('theme')) {
    requirements.push('styling: custom');
  }
  
  // Extract direction preferences
  if (lowerPrompt.includes('top to bottom') || lowerPrompt.includes('vertical')) {
    requirements.push('direction: TB');
  } else if (lowerPrompt.includes('left to right') || lowerPrompt.includes('horizontal')) {
    requirements.push('direction: LR');
  }
  
  return requirements;
}

// Build OpenAI prompt with context
export function buildOpenAIPrompt(
  userPrompt: string, 
  currentDiagram: string,
  intent: ProcessedPrompt
): string {
  let systemPrompt = SYSTEM_PROMPTS.DIAGRAM_ASSISTANT;
  
  // Add specific instructions based on intent
  switch (intent.intent) {
    case 'create':
      systemPrompt += `\n\nYou are creating a new diagram from scratch. Focus on proper structure and clear organization.`;
      break;
    case 'modify':
      systemPrompt += `\n\nYou are modifying an existing diagram. Preserve the existing structure and add requested changes seamlessly.`;
      break;
    case 'explain':
      systemPrompt += `\n\n${SYSTEM_PROMPTS.DIAGRAM_ANALYZER}`;
      break;
    case 'help':
      systemPrompt += `\n\nProvide helpful guidance and examples for diagram creation.`;
      break;
    default:
      systemPrompt += `\n\nAnalyze the request and provide the most appropriate response.`;
  }
  
  let fullPrompt = systemPrompt;
  
  // Add current diagram context if available
  if (currentDiagram.trim()) {
    fullPrompt += `\n\nCurrent diagram:\n\`\`\`mermaid\n${currentDiagram}\n\`\`\``;
  }
  
  // Add user requirements if extracted
  if (intent.requirements && intent.requirements.length > 0) {
    fullPrompt += `\n\nExtracted requirements:\n${intent.requirements.join('\n')}`;
  }
  
  // Add user prompt
  fullPrompt += `\n\nUser request: ${userPrompt}`;
  
  return fullPrompt;
}

// Parse OpenAI response and extract diagram updates
export function parseAIResponse(response: string): DiagramUpdate {
  const mermaidMatch = response.match(/```mermaid\n([\s\S]*?)\n```/);
  const diagram = mermaidMatch ? mermaidMatch[1].trim() : '';
  
  // Extract explanation (text before or after code block)
  let explanation = response;
  if (mermaidMatch) {
    explanation = response.replace(/```mermaid\n[\s\S]*?\n```/, '').trim();
  }
  
  // Clean up explanation
  explanation = explanation
    .replace(/^Here's\s+/i, '')
    .replace(/^I've\s+/i, '')
    .replace(/^The\s+updated\s+/i, '')
    .trim();
  
  return {
    diagram,
    explanation,
    confidence: diagram ? 0.9 : 0.3,
    changes: extractChanges(explanation)
  };
}

// Extract specific changes from explanation
function extractChanges(explanation: string): string[] {
  const changes: string[] = [];
  const lowerExplanation = explanation.toLowerCase();
  
  if (lowerExplanation.includes('added')) {
    changes.push('additions');
  }
  if (lowerExplanation.includes('removed') || lowerExplanation.includes('deleted')) {
    changes.push('deletions');
  }
  if (lowerExplanation.includes('modified') || lowerExplanation.includes('changed')) {
    changes.push('modifications');
  }
  if (lowerExplanation.includes('connected') || lowerExplanation.includes('linked')) {
    changes.push('connections');
  }
  if (lowerExplanation.includes('styled') || lowerExplanation.includes('colored')) {
    changes.push('styling');
  }
  
  return changes;
}

// Generate suggestions based on current diagram
export function generateSuggestions(currentDiagram: string): string[] {
  if (!currentDiagram.trim()) {
    return [
      "Create a simple flowchart",
      "Make a sequence diagram",
      "Build a class diagram",
      "Design a state diagram"
    ];
  }
  
  const suggestions: string[] = [];
  const lowerDiagram = currentDiagram.toLowerCase();
  
  // Analyze current diagram type and suggest improvements
  if (lowerDiagram.includes('flowchart') || lowerDiagram.includes('graph')) {
    suggestions.push("Add decision points", "Include error handling paths", "Add styling and colors");
  } else if (lowerDiagram.includes('sequence')) {
    suggestions.push("Add more participants", "Include activation boxes", "Add notes and comments");
  } else if (lowerDiagram.includes('class')) {
    suggestions.push("Add inheritance relationships", "Include method signatures", "Add associations");
  } else if (lowerDiagram.includes('state')) {
    suggestions.push("Add more transitions", "Include guard conditions", "Add composite states");
  } else {
    suggestions.push("Add more nodes", "Improve connections", "Add colors and styling");
  }
  
  return suggestions;
}