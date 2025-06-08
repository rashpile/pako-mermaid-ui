import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useDiagramStore } from '../store/diagramStore';
import { useSettingsStore } from '../store/settingsStore';
import { chatService } from '../services/chatService';
import { ChatRequest } from '../types/chat';
import { useDebouncedCallback } from './useDebounce';

/**
 * Custom hook for managing AI chat functionality
 */
export function useChat() {
  const {
    messages,
    isLoading,
    error,
    currentInput,
    isVisible,
    addMessage,
    setCurrentInput,
    setLoading,
    setError,
    clearMessages,
    deleteMessage,
    retryLastMessage,
    toggleVisibility,
    setVisible,
    getConversationHistory,
    getLastUserMessage,
    getLastAssistantMessage
  } = useChatStore();

  const { currentDiagram, updateDiagramContent } = useDiagramStore();
  const { apiKey } = useSettingsStore();

  // Check if chat is available (API key is set)
  const isChatAvailable = apiKey.hasKey && apiKey.isValid !== false;

  // Send message to AI
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !isChatAvailable) return;

    // Add user message
    addMessage('user', message.trim());
    setCurrentInput('');
    setLoading(true);
    setError(null);

    try {
      // Prepare chat request
      const request: ChatRequest = {
        message: message.trim(),
        currentDiagram: currentDiagram?.content,
        context: {
          diagramType: detectDiagramType(currentDiagram?.content || ''),
          previousMessages: getConversationHistory().slice(-6) // Last 3 exchanges
        }
      };

      // Process with AI
      const response = await chatService.processChat(request);

      if (response.error) {
        setError(response.error);
        addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.');
      } else {
        // Add AI response
        addMessage('assistant', response.message, {
          diagramUpdate: !!response.updatedDiagram
        });

        // Update diagram if provided
        if (response.updatedDiagram && currentDiagram) {
          updateDiagramContent(response.updatedDiagram);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message';
      setError(errorMessage);
      addMessage('assistant', 'I apologize, but I encountered an error. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }, [
    isChatAvailable,
    currentDiagram,
    addMessage,
    setCurrentInput,
    setLoading,
    setError,
    updateDiagramContent,
    getConversationHistory
  ]);

  // Debounced send message for rapid typing
  const sendMessageDebounced = useDebouncedCallback(
    sendMessage, 
    300, 
    [sendMessage]
  );

  // Quick send with current input
  const sendCurrentMessage = useCallback(() => {
    if (currentInput.trim()) {
      sendMessage(currentInput);
    }
  }, [currentInput, sendMessage]);

  // Apply diagram update from AI response
  const applyDiagramUpdate = useCallback((diagramCode: string) => {
    if (currentDiagram) {
      updateDiagramContent(diagramCode);
      addMessage('user', 'Applied diagram update');
    }
  }, [currentDiagram, updateDiagramContent, addMessage]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    clearMessages();
    setError(null);
  }, [clearMessages, setError]);

  // Retry last failed message
  const retryLastFailedMessage = useCallback(() => {
    const lastUserMsg = getLastUserMessage();
    if (lastUserMsg) {
      retryLastMessage();
      sendMessage(lastUserMsg.content);
    }
  }, [getLastUserMessage, retryLastMessage, sendMessage]);

  // Get conversation statistics
  const getConversationStats = useCallback(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    const diagramUpdates = messages.filter(m => m.metadata?.diagramUpdate).length;
    
    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      diagramUpdates,
      hasConversation: messages.length > 0
    };
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages.length]);

  return {
    // State
    messages,
    isLoading,
    error,
    currentInput,
    isVisible,
    isChatAvailable,
    
    // Message actions
    sendMessage,
    sendMessageDebounced,
    sendCurrentMessage,
    setCurrentInput,
    addMessage,
    deleteMessage,
    retryLastFailedMessage,
    startNewConversation,
    
    // Diagram actions
    applyDiagramUpdate,
    
    // UI actions
    toggleVisibility,
    setVisible,
    
    // Utilities
    getConversationStats,
    conversationHistory: getConversationHistory(),
    lastUserMessage: getLastUserMessage(),
    lastAssistantMessage: getLastAssistantMessage()
  };
}

/**
 * Hook for managing chat suggestions and quick actions
 */
export function useChatSuggestions() {
  const { currentDiagram } = useDiagramStore();
  const { sendMessage } = useChat();

  // Generate contextual suggestions based on current diagram
  const getSuggestions = useCallback(() => {
    const suggestions = [
      'Add error handling to this flow',
      'Make this diagram more detailed',
      'Convert to a different diagram type',
      'Add colors and styling',
      'Simplify this diagram'
    ];

    // Add diagram-specific suggestions
    if (currentDiagram?.content) {
      const content = currentDiagram.content.toLowerCase();
      
      if (content.includes('flowchart')) {
        suggestions.unshift('Add decision points', 'Include parallel processes');
      } else if (content.includes('sequence')) {
        suggestions.unshift('Add error scenarios', 'Include activation boxes');
      } else if (content.includes('class')) {
        suggestions.unshift('Add method parameters', 'Include inheritance relationships');
      }
    }

    return suggestions.slice(0, 6);
  }, [currentDiagram]);

  // Send a suggestion as a message
  const sendSuggestion = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  return {
    suggestions: getSuggestions(),
    sendSuggestion
  };
}

// Helper function to detect diagram type from content
function detectDiagramType(content: string): string | undefined {
  const normalizedContent = content.toLowerCase().trim();
  
  if (normalizedContent.startsWith('flowchart') || normalizedContent.startsWith('graph')) {
    return 'flowchart';
  } else if (normalizedContent.startsWith('sequencediagram')) {
    return 'sequence';
  } else if (normalizedContent.startsWith('classdiagram')) {
    return 'class';
  } else if (normalizedContent.startsWith('statediagram')) {
    return 'state';
  } else if (normalizedContent.startsWith('erdiagram')) {
    return 'er';
  } else if (normalizedContent.startsWith('gantt')) {
    return 'gantt';
  } else if (normalizedContent.startsWith('pie')) {
    return 'pie';
  } else if (normalizedContent.startsWith('gitgraph')) {
    return 'gitgraph';
  } else if (normalizedContent.startsWith('mindmap')) {
    return 'mindmap';
  } else if (normalizedContent.startsWith('journey')) {
    return 'journey';
  }
  
  return undefined;
}