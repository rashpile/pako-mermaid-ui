import { useAppContext, AppInitializing } from './AppProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useDiagram } from '../../hooks/useDiagram';
import { useChat } from '../../hooks/useChat';
import { SplitLayout } from '../Layout';
import { Toolbar } from '../Toolbar';
import { MonacoEditor } from '../Editor';
import { MermaidPreview } from '../Preview';
import { ChatContainer } from '../Chat';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function App() {
  const { isInitialized } = useAppContext();
  const { layoutSettings } = useSettingsStore();
  const { diagram, content, updateContent } = useDiagram();
  const { isVisible: isChatVisible, setVisible: setChatVisible } = useChat();

  // Show loading screen while initializing
  if (!isInitialized) {
    return <AppInitializing />;
  }


  // Handle diagram updates from chat
  const handleChatDiagramUpdate = (diagramCode: string) => {
    updateContent(diagramCode);
  };

  // Toggle chat visibility
  const handleChatToggle = () => {
    const newVisibility = !isChatVisible;
    setChatVisible(newVisibility);
    
    // Also update the layout settings to show/hide the right panel
    const { updateLayoutSettings } = useSettingsStore.getState();
    updateLayoutSettings({ showRightPanel: newVisibility });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main Toolbar */}
      <Toolbar className="flex-none" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary>
          <SplitLayout
          leftPanel={
            <div className="h-full flex flex-col">
              {/* Editor Header */}
              <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Editor
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Lines: {content.split('\n').length}</span>
                    <span>•</span>
                    <span>Chars: {content.length}</span>
                  </div>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 overflow-hidden">
                <MonacoEditor />
              </div>
            </div>
          }
          centerPanel={
            <div className="h-full flex flex-col">
              {/* Preview Header */}
              <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Preview
                  </h3>
                  <div className="flex items-center space-x-2">
                    {diagram?.name && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {diagram.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mermaid Preview */}
              <div className="flex-1 overflow-hidden" data-mermaid-preview>
                <MermaidPreview />
              </div>
            </div>
          }
          rightPanel={
            (layoutSettings.showRightPanel || isChatVisible) ? (
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      AI Assistant
                    </h3>
                    <button
                      onClick={() => layoutSettings.showRightPanel && handleChatToggle()}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title="Close chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 overflow-hidden">
                  <ChatContainer
                    isVisible={isChatVisible}
                    onToggle={handleChatToggle}
                    onDiagramUpdate={handleChatDiagramUpdate}
                    currentDiagram={content}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">AI Assistant is hidden</p>
                  <button
                    onClick={handleChatToggle}
                    className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    Show AI Assistant
                  </button>
                </div>
              </div>
            )
          }
          className="h-full"
        />
        </ErrorBoundary>
      </div>

      {/* Status Bar */}
      <div className="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-1">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>
              Mermaid Editor v1.0.0
            </span>
            {diagram?.lastModified && (
              <span>
                Modified: {new Date(diagram.lastModified).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>
              {content.split('\n').length} lines
            </span>
            <span>
              {content.length} characters
            </span>
            {layoutSettings.showRightPanel && (
              <span className="text-green-500">
                AI Assistant Active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}