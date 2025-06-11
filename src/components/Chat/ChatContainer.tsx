import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useOpenAI } from '../../hooks/useOpenAI';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ApiKeySettings } from './ApiKeySettings';

interface ChatContainerProps {
  isVisible: boolean;
  onToggle: () => void;
  onDiagramUpdate: (diagram: string) => void;
  className?: string;
}

export function ChatContainer({
  isVisible,
  onToggle,
  onDiagramUpdate,
  className = ''
}: ChatContainerProps) {
  const {
    messages,
    isLoading,
    error,
    currentInput,
    isChatAvailable,
    sendMessage,
    setCurrentInput,
    startNewConversation,
    applyDiagramUpdate,
    getConversationStats
  } = useChat();

  const { hasApiKey, isValidKey, isReady } = useOpenAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationStats = getConversationStats();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle diagram updates from chat
  const handleDiagramUpdate = (diagramCode: string) => {
    applyDiagramUpdate(diagramCode);
    onDiagramUpdate(diagramCode);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`chat-container flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="chat-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              AI Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isReady ? 'Ready to help' : 'Configure API key to start'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {conversationStats.hasConversation && (
            <button
              onClick={startNewConversation}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Start new conversation"
            >
              New
            </button>
          )}
          
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Close chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* API Key Configuration */}
      {(!hasApiKey || !isValidKey) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <ApiKeySettings />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && isReady ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm mb-2">Hi! I'm your Mermaid diagram assistant.</p>
            <p className="text-xs">
              Ask me to create, modify, or improve your diagrams using natural language.
            </p>
            <div className="mt-4 text-xs space-y-1">
              <p className="font-medium">Try asking:</p>
              <ul className="text-left space-y-1 max-w-xs mx-auto">
                <li>• "Add error handling to this flow"</li>
                <li>• "Convert this to a sequence diagram"</li>
                <li>• "Make this diagram more detailed"</li>
                <li>• "Add colors and styling"</li>
              </ul>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-2xl mb-2">🔑</div>
            <p className="text-sm">Configure your OpenAI API key to start chatting</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onApplyDiagram={handleDiagramUpdate}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Check your API key and try again.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <ChatInput
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={sendMessage}
          disabled={!isChatAvailable || isLoading}
          placeholder={
            !hasApiKey 
              ? "Configure API key first..." 
              : !isValidKey 
                ? "Invalid API key..." 
                : "Ask me to modify your diagram..."
          }
        />
        
        {conversationStats.hasConversation && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>
              {conversationStats.userMessages} messages • {conversationStats.diagramUpdates} updates
            </span>
            {isReady && (
              <span className="text-green-500 dark:text-green-400">
                ● Ready
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}