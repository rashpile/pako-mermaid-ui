import { openAIService } from './openaiService';
import { ChatRequest, ChatResponse, DiagramUpdateRequest, DiagramUpdateResponse } from '../types/chat';
import { SYSTEM_PROMPTS, buildContextualPrompt } from '../prompts/systemPrompts';
import { categorizeUserIntent, extractDiagramType } from '../prompts/examples';
import { debounceAsync } from '../utils/debounce';

class ChatService {
  // Process a chat request and return response
  async processChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { message, currentDiagram, context } = request;
      
      // Categorize user intent
      const intent = categorizeUserIntent(message);
      const diagramType = extractDiagramType(message);
      
      // Build appropriate system prompt based on context
      const systemPrompt = buildContextualPrompt(
        SYSTEM_PROMPTS.DIAGRAM_ASSISTANT,
        {
          diagramType: diagramType || context?.diagramType,
          currentDiagram,
          userIntent: message
        }
      );

      // Generate response using OpenAI
      const result = await openAIService.generateDiagram(
        message,
        currentDiagram,
        systemPrompt
      );

      // Determine if this is a diagram update
      const isUpdate = currentDiagram && currentDiagram.trim() !== result.diagram.trim();

      return {
        message: result.explanation,
        updatedDiagram: isUpdate ? result.diagram : undefined,
        suggestions: this.generateSuggestions(intent, result.diagram)
      };
    } catch (error) {
      console.error('Chat processing failed:', error);
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process diagram update requests specifically
  async updateDiagram(request: DiagramUpdateRequest): Promise<DiagramUpdateResponse> {
    try {
      const { currentDiagram, userPrompt, conversationHistory } = request;
      
      // Build context-aware prompt for diagram updates
      const systemPrompt = buildContextualPrompt(
        SYSTEM_PROMPTS.DIAGRAM_ASSISTANT,
        {
          currentDiagram,
          userIntent: userPrompt
        }
      );

      const result = await openAIService.generateDiagram(
        userPrompt,
        currentDiagram,
        systemPrompt
      );

      // Analyze changes made
      const changes = this.analyzeChanges(currentDiagram, result.diagram);

      return {
        updatedDiagram: result.diagram,
        explanation: result.explanation,
        changes
      };
    } catch (error) {
      throw new Error(`Diagram update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze diagram for suggestions
  async analyzeDiagram(diagram: string): Promise<string[]> {
    try {
      const analysisPrompt = buildContextualPrompt(
        SYSTEM_PROMPTS.IMPROVEMENT_SUGGESTIONS,
        { currentDiagram: diagram }
      );

      const response = await openAIService.chatWithContext(
        [{ 
          id: 'analysis', 
          role: 'user', 
          content: 'Please analyze this diagram and provide improvement suggestions.',
          timestamp: new Date()
        }],
        analysisPrompt
      );

      // Extract suggestions from response
      return this.extractSuggestions(response);
    } catch (error) {
      console.error('Diagram analysis failed:', error);
      return [];
    }
  }

  // Debounced version of processChat for real-time usage
  processChatDebounced = debounceAsync(
    (request: ChatRequest) => this.processChat(request),
    500
  );

  // Helper method to generate contextual suggestions
  private generateSuggestions(intent: string, diagram: string): string[] {
    const suggestions: string[] = [];

    switch (intent) {
      case 'CREATE':
        suggestions.push(
          'Add more detail to specific steps',
          'Include error handling paths',
          'Consider adding colors or styling'
        );
        break;
      case 'MODIFY':
        suggestions.push(
          'Add validation steps',
          'Include alternative flows',
          'Consider performance implications'
        );
        break;
      case 'ENHANCE':
        suggestions.push(
          'Add decision points',
          'Include stakeholder interactions',
          'Consider edge cases'
        );
        break;
      default:
        suggestions.push(
          'Export your diagram when ready',
          'Save this version for later',
          'Try adding more context'
        );
    }

    // Add diagram-type specific suggestions
    if (diagram.includes('flowchart')) {
      suggestions.push('Consider converting to sequence diagram for process flows');
    } else if (diagram.includes('sequenceDiagram')) {
      suggestions.push('Add error handling scenarios');
    } else if (diagram.includes('classDiagram')) {
      suggestions.push('Include method parameters and return types');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  // Analyze changes between two diagrams
  private analyzeChanges(oldDiagram: string, newDiagram: string) {
    const changes = [];
    
    // Simple change detection (could be enhanced with more sophisticated diffing)
    const oldLines = oldDiagram.split('\n').filter(line => line.trim());
    const newLines = newDiagram.split('\n').filter(line => line.trim());
    
    // Find added lines
    newLines.forEach((line, index) => {
      if (!oldLines.includes(line)) {
        changes.push({
          type: 'add' as const,
          element: line.trim(),
          description: `Added: ${line.trim()}`,
          location: { line: index + 1, column: 0 }
        });
      }
    });
    
    // Find removed lines
    oldLines.forEach((line, index) => {
      if (!newLines.includes(line)) {
        changes.push({
          type: 'remove' as const,
          element: line.trim(),
          description: `Removed: ${line.trim()}`,
          location: { line: index + 1, column: 0 }
        });
      }
    });
    
    return changes;
  }

  // Extract suggestions from AI response
  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    
    // Look for numbered lists or bullet points
    const lines = response.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[\d\-\*]\.\s/) || trimmed.match(/^[\-\*]\s/)) {
        const suggestion = trimmed.replace(/^[\d\-\*\.\s]+/, '').trim();
        if (suggestion.length > 10) { // Filter out very short suggestions
          suggestions.push(suggestion);
        }
      }
    });
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  // Validate diagram syntax (placeholder for future Mermaid validation)
  async validateDiagram(diagram: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      // This would integrate with Mermaid's validation once we implement the preview
      // For now, basic syntax checking
      const errors: string[] = [];
      
      if (!diagram.trim()) {
        errors.push('Diagram cannot be empty');
      }
      
      // Check for basic Mermaid syntax
      const validStarters = [
        'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 
        'stateDiagram', 'erDiagram', 'gantt', 'pie', 'gitgraph',
        'mindmap', 'journey'
      ];
      
      const hasValidStarter = validStarters.some(starter => 
        diagram.toLowerCase().includes(starter.toLowerCase())
      );
      
      if (!hasValidStarter) {
        errors.push('Diagram must start with a valid Mermaid diagram type');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      };
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();

// Export class for testing
export { ChatService };