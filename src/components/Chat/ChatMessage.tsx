import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  onApplyDiagram?: (diagram: string) => void;
}

export function ChatMessage({ message, onRetry, onApplyDiagram }: ChatMessageProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const isUser = message.role === 'user';
  const isError = message.metadata?.error;

  // Extract Mermaid code from message content
  const extractMermaidCode = (content: string): string | null => {
    const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/);
    return mermaidMatch ? mermaidMatch[1].trim() : null;
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Render message content with Mermaid code highlighting
  const renderContent = (content: string) => {
    const parts = content.split(/(```mermaid\n[\s\S]*?\n```)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('```mermaid\n')) {
        const code = extractMermaidCode(part);
        if (!code) return part;
        
        return (
          <div key={index} className="my-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Mermaid Diagram
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Copy code"
                  >
                    {copiedText === code ? 'Copied!' : 'Copy'}
                  </button>
                  {onApplyDiagram && (
                    <button
                      onClick={() => onApplyDiagram(code)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      title="Apply to diagram"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
              <pre className="p-3 text-sm font-mono overflow-x-auto">
                <code className="text-gray-800 dark:text-gray-200">{code}</code>
              </pre>
            </div>
          </div>
        );
      }
      
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 ${
          isUser
            ? 'bg-blue-500 text-white'
            : isError
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}
      >
        {/* Message Content */}
        <div className="text-sm">
          {typeof message.content === 'string' ? (
            renderContent(message.content)
          ) : (
            <span>{String(message.content)}</span>
          )}
        </div>

        {/* Message Metadata */}
        <div className={`flex items-center justify-between mt-2 text-xs ${
          isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          
          <div className="flex items-center space-x-2">
            {message.metadata?.diagramUpdate && (
              <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                Updated
              </span>
            )}
            
            {message.metadata?.processingTime && (
              <span title={`Processing time: ${message.metadata.processingTime}ms`}>
                ⚡
              </span>
            )}
            
            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                title="Retry message"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Copy full message button for non-user messages */}
        {!isUser && (
          <button
            onClick={() => copyToClipboard(message.content)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Copy full message"
          >
            {copiedText === message.content ? 'Message copied!' : 'Copy message'}
          </button>
        )}
      </div>
    </div>
  );
}