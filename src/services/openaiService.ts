import { OpenAI } from 'openai';
import { 
  ApiConfig,
  HttpError 
} from '../types/api';
import { ChatMessage } from '../types/chat';
import { getApiKey } from '../utils/storage';

class OpenAIService {
  private client: OpenAI | null = null;
  private config: ApiConfig | null = null;

  // Initialize the OpenAI client
  private initializeClient(): boolean {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    try {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should go through a backend
      });
      
      this.config = {
        openaiApiKey: apiKey,
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7
      };
      
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      return false;
    }
  }

  // Validate API key by making a simple request
  async validateApiKey(): Promise<boolean> {
    try {
      if (!this.initializeClient()) {
        return false;
      }

      // Make a minimal request to test the API key
      const response = await this.client!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return !!response.choices[0]?.message;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  // Generate diagram based on user prompt
  async generateDiagram(
    prompt: string,
    currentDiagram?: string,
    systemPrompt?: string
  ): Promise<{ diagram: string; explanation: string }> {
    if (!this.initializeClient()) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt || `You are an expert Mermaid diagram assistant. Generate valid Mermaid diagram syntax based on user requests.
          
Rules:
1. Always respond with valid Mermaid syntax wrapped in \`\`\`mermaid code blocks
2. Provide a brief explanation of the diagram
3. Ensure the diagram is clear and well-structured
4. If modifying an existing diagram, preserve the overall structure where possible`
        }
      ];

      if (currentDiagram) {
        messages.push({
          role: 'user',
          content: `Current diagram:\n\`\`\`mermaid\n${currentDiagram}\n\`\`\`\n\nRequest: ${prompt}`
        });
      } else {
        messages.push({
          role: 'user',
          content: prompt
        });
      }

      const response = await this.client!.chat.completions.create({
        model: this.config!.model,
        messages,
        max_tokens: this.config!.maxTokens,
        temperature: this.config!.temperature
      });

      console.log('[OpenAI] Raw API response:', {
        model: response.model,
        usage: response.usage,
        choices: response.choices.length,
        finishReason: response.choices[0]?.finish_reason
      });

      const content = response.choices[0]?.message?.content;
      console.log('[OpenAI] AI Response Content:', content);
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Extract Mermaid diagram from response
      const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/);
      const diagram = mermaidMatch ? mermaidMatch[1].trim() : '';
      
      // Extract explanation (everything outside code blocks)
      const explanation = content
        .replace(/```mermaid\n[\s\S]*?\n```/g, '')
        .trim();

      console.log('[OpenAI] Extracted diagram:', diagram?.substring(0, 100) + '...');
      console.log('[OpenAI] Extracted explanation:', explanation?.substring(0, 200) + '...');

      if (!diagram) {
        throw new Error('No valid Mermaid diagram found in response');
      }

      return { diagram, explanation };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpError(error.message, undefined, 'OPENAI_ERROR');
      }
      throw new HttpError('Unknown error occurred', undefined, 'UNKNOWN_ERROR');
    }
  }

  // Chat with context for diagram assistance
  async chatWithContext(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<string> {
    if (!this.initializeClient()) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt || 'You are a helpful Mermaid diagram assistant.'
        }
      ];

      // Convert chat messages to OpenAI format
      messages.forEach(msg => {
        if (msg.role !== 'system') {
          openaiMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      });

      const response = await this.client!.chat.completions.create({
        model: this.config!.model,
        messages: openaiMessages,
        max_tokens: this.config!.maxTokens,
        temperature: this.config!.temperature
      });

      console.log('[OpenAI] Chat API response:', {
        model: response.model,
        usage: response.usage,
        choices: response.choices.length,
        finishReason: response.choices[0]?.finish_reason
      });

      const content = response.choices[0]?.message?.content;
      console.log('[OpenAI] Chat Response Content:', content);
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpError(error.message, undefined, 'OPENAI_ERROR');
      }
      throw new HttpError('Unknown error occurred', undefined, 'UNKNOWN_ERROR');
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<ApiConfig>): void {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
    }
  }

  // Get current configuration
  getConfig(): ApiConfig | null {
    return this.config;
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  // Reset service (useful for API key changes)
  reset(): void {
    this.client = null;
    this.config = null;
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();

// Export class for testing
export { OpenAIService };