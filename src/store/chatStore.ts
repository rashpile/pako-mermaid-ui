import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ChatMessage, ChatState, MessageRole } from '../types/chat';

interface ChatStore extends ChatState {
  // UI state
  isVisible: boolean;
  
  // Actions
  addMessage: (role: MessageRole, content: string, metadata?: ChatMessage['metadata']) => void;
  updateLastMessage: (content: string, metadata?: ChatMessage['metadata']) => void;
  setCurrentInput: (input: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
  retryLastMessage: () => void;
  
  // UI actions
  toggleVisibility: () => void;
  setVisible: (visible: boolean) => void;
  
  // Utility actions
  getConversationHistory: () => ChatMessage[];
  getLastUserMessage: () => ChatMessage | null;
  getLastAssistantMessage: () => ChatMessage | null;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const createMessage = (
  role: MessageRole, 
  content: string, 
  metadata?: ChatMessage['metadata']
): ChatMessage => ({
  id: generateMessageId(),
  role,
  content,
  timestamp: new Date(),
  metadata
});

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    messages: [],
    isLoading: false,
    error: undefined,
    currentInput: '',
    isVisible: false,

    // Message management
    addMessage: (role, content, metadata) => {
      const message = createMessage(role, content, metadata);
      set(state => ({
        messages: [...state.messages, message],
        error: undefined // Clear any previous errors when adding new message
      }));
    },

    updateLastMessage: (content, metadata) => {
      set(state => {
        const messages = [...state.messages];
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          messages[messages.length - 1] = {
            ...lastMessage,
            content,
            metadata: { ...lastMessage.metadata, ...metadata }
          };
        }
        return { messages };
      });
    },

    setCurrentInput: (input) => set({ currentInput: input }),

    setLoading: (loading) => set({ 
      isLoading: loading,
      error: loading ? undefined : get().error // Clear error when starting to load
    }),

    setError: (error) => set({ 
      error,
      isLoading: false // Stop loading when there's an error
    }),

    clearMessages: () => set({ 
      messages: [],
      error: undefined,
      currentInput: ''
    }),

    deleteMessage: (id) => {
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== id)
      }));
    },

    retryLastMessage: () => {
      const { messages } = get();
      if (messages.length === 0) return;

      // Find the last user message to retry
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          const userMessage = messages[i];
          
          // Remove all messages after the user message (including assistant responses)
          set(state => ({
            messages: state.messages.slice(0, i + 1),
            currentInput: userMessage.content,
            error: undefined
          }));
          break;
        }
      }
    },

    // UI actions
    toggleVisibility: () => set(state => ({ 
      isVisible: !state.isVisible 
    })),

    setVisible: (visible) => set({ isVisible: visible }),

    // Utility functions
    getConversationHistory: () => {
      const { messages } = get();
      // Return messages excluding system messages for conversation context
      return messages.filter(msg => msg.role !== 'system');
    },

    getLastUserMessage: () => {
      const { messages } = get();
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          return messages[i];
        }
      }
      return null;
    },

    getLastAssistantMessage: () => {
      const { messages } = get();
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          return messages[i];
        }
      }
      return null;
    }
  }))
);

// Selector hooks for optimized component re-renders
export const useChatMessages = () => useChatStore(state => state.messages);
export const useChatLoading = () => useChatStore(state => state.isLoading);
export const useChatError = () => useChatStore(state => state.error);
export const useChatInput = () => useChatStore(state => state.currentInput);
export const useChatVisibility = () => useChatStore(state => state.isVisible);

// Helper hook for getting conversation context
export const useChatContext = () => useChatStore(state => ({
  messages: state.messages,
  isLoading: state.isLoading,
  error: state.error,
  conversationHistory: state.getConversationHistory(),
  lastUserMessage: state.getLastUserMessage(),
  lastAssistantMessage: state.getLastAssistantMessage()
}));

// Subscribe to message changes for debugging/logging
if (process.env.NODE_ENV === 'development') {
  useChatStore.subscribe(
    (state) => state.messages,
    (messages) => {
      console.log('Chat messages updated:', messages.length, 'messages');
    }
  );
}