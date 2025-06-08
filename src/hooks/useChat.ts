import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useDiagramStore } from '../store/diagramStore';
import { useSettingsStore } from '../store/settingsStore';
import { chatService } from '../services/chatService';
import { ChatRequest } from '../types/chat';
import { useDebouncedCallback } from './useDebounce';
import { analyzeIntent, buildOpenAIPrompt, parseAIResponse, generateSuggestions } from '../utils/aiPromptProcessor';
import { validateMermaidSyntax } from '../utils/mermaidValidator';
import { analyzeDiagram } from '../utils/diagramAnalyzer';

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

    const startTime = Date.now();
    
    // Add user message
    addMessage('user', message.trim());
    setCurrentInput('');
    setLoading(true);
    setError(null);

    try {
      const currentContent = currentDiagram?.content || '';
      
      // Analyze user intent
      const intent = analyzeIntent(message, currentContent);
      
      // Analyze current diagram
      const diagramAnalysis = analyzeDiagram(currentContent);
      
      // Build comprehensive prompt
      const prompt = buildOpenAIPrompt(message, currentContent, intent);
      
      // Prepare enhanced chat request
      const request: ChatRequest = {
        message: message.trim(),
        currentDiagram: currentContent,
        context: {
          diagramType: detectDiagramType(currentContent),
          previousMessages: getConversationHistory().slice(-6),
          intent: intent.intent,
          confidence: intent.confidence,
          diagramAnalysis,
          suggestions: generateSuggestions(currentContent)
        }
      };

      // Process with AI
      const response = await chatService.processChat(request);
      const processingTime = Date.now() - startTime;

      if (response.error) {
        setError(response.error);
        addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.', {
          error: true,
          processingTime
        });
      } else {
        // Parse AI response for diagram updates
        const aiUpdate = parseAIResponse(response.message);
        
        // Validate generated diagram if present
        let validationResult = null;
        if (aiUpdate.diagram) {
          validationResult = validateMermaidSyntax(aiUpdate.diagram);
        }
        
        // Add AI response with metadata
        addMessage('assistant', response.message, {
          diagramUpdate: !!aiUpdate.diagram && validationResult?.isValid,
          processingTime,
          intent: intent.intent,
          confidence: aiUpdate.confidence,
          validationResult
        });

        // Update diagram if provided and valid
        if (aiUpdate.diagram && validationResult?.isValid && currentDiagram) {
          updateDiagramContent(aiUpdate.diagram);
        } else if (aiUpdate.diagram && !validationResult?.isValid) {
          // Show validation errors
          addMessage('assistant', `The generated diagram has validation issues:\n${validationResult?.errors.map(e => `• ${e.message}`).join('\n')}`, {
            error: true,
            validationResult
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message';
      const processingTime = Date.now() - startTime;
      setError(errorMessage);
      addMessage('assistant', 'I apologize, but I encountered an error. Please check your API key and try again.', {
        error: true,
        processingTime
      });
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

  // Debounced send message for rapid typing (non-async version)
  const sendMessageDebounced = useDebouncedCallback(
    (message: string) => {
      sendMessage(message); // Fire and forget for debounced version
    }, 
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
    if (currentDiagram?.content) {
      return generateSuggestions(currentDiagram.content);
    }
    
    return [
      'Create a simple flowchart',
      'Make a sequence diagram',
      'Build a class diagram', 
      'Design a state diagram',
      'Add colors and styling',
      'Show me examples'
    ];
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