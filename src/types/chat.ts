// AI Chat related types and interfaces

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    diagramUpdate?: boolean;
    error?: boolean;
    processingTime?: number;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  currentInput: string;
}

export interface ChatRequest {
  message: string;
  currentDiagram?: string;
  context?: {
    diagramType?: string;
    previousMessages?: ChatMessage[];
  };
}

export interface ChatResponse {
  message: string;
  updatedDiagram?: string;
  suggestions?: string[];
  error?: string;
}

export interface DiagramUpdateRequest {
  currentDiagram: string;
  userPrompt: string;
  conversationHistory?: ChatMessage[];
}

export interface DiagramUpdateResponse {
  updatedDiagram: string;
  explanation: string;
  changes: DiagramChange[];
}

export interface DiagramChange {
  type: 'add' | 'remove' | 'modify';
  element: string;
  description: string;
  location?: {
    line: number;
    column: number;
  };
}

// Chat UI component props
export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
  onRetry?: () => void;
  onApplyDiagram?: (diagram: string) => void;
}

export interface ChatContainerProps {
  isVisible: boolean;
  onToggle: () => void;
  onDiagramUpdate: (diagram: string) => void;
  currentDiagram: string;
}

// API Key management
export interface ApiKeyState {
  hasKey: boolean;
  isValid?: boolean;
  lastValidated?: Date;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
  model?: string;
  usage?: {
    tokensUsed: number;
    tokensRemaining?: number;
  };
}