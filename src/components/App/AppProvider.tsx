import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettingsStore } from '../../store/settingsStore';
import { useDiagramStore } from '../../store/diagramStore';
import { useChatStore } from '../../store/chatStore';
import { EXAMPLE_DIAGRAMS } from '../../constants/examples';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppContextValue {
  queryClient: QueryClient;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { settings, apiKey, validateApiKey } = useSettingsStore();
  const { setCurrentDiagram, currentDiagram, editorState } = useDiagramStore();
  const { clearMessages } = useChatStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Validate API key if present
        if (apiKey.hasKey) {
          await validateApiKey();
        }

        // Load default diagram if none exists
        if (!editorState.content.trim() && !currentDiagram) {
          const defaultExample = EXAMPLE_DIAGRAMS[0];
          if (defaultExample) {
            setCurrentDiagram({
              id: 'default',
              name: 'Simple Flowchart',
              content: defaultExample.example,
              description: defaultExample.description,
              created: new Date(),
              createdAt: new Date(),
              lastModified: new Date(),
              updatedAt: new Date()
            });
          }
        }

        // Clear any stale chat messages on app start
        clearMessages();

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsInitialized(true); // Still mark as initialized to prevent blocking
      }
    };

    initializeApp();
  }, [apiKey.hasKey, validateApiKey, editorState.content, currentDiagram, setCurrentDiagram, clearMessages]);

  // Handle theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (settings.theme === 'dark' || 
          (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes when in system mode
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  // Handle keyboard shortcuts at app level
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Global shortcuts that work everywhere
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case '/':
            // Focus search or chat input
            event.preventDefault();
            const chatInput = document.querySelector('textarea[placeholder*="Ask me"]') as HTMLTextAreaElement;
            if (chatInput) {
              chatInput.focus();
            }
            break;
          case 'k':
            // Quick command palette (future enhancement)
            event.preventDefault();
            // Could open a command palette in the future
            break;
        }
      }

      // Escape key to close modals/dialogs
      if (event.key === 'Escape') {
        // Let individual components handle their own escape logic
        // This is just a fallback for any missed cases
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Error boundary effect
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Could integrate with error reporting service here
    };

    const handleError = (event: ErrorEvent) => {
      // Filter out benign DOM manipulation errors from Monaco/Mermaid
      const error = event.error;
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';
        
        // Skip known benign errors
        if (
          message.includes('removeChild') ||
          message.includes('not a child of this node') ||
          message.includes('monaco') ||
          message.includes('mermaid') ||
          message.includes('canceled') ||
          message.includes('cancelled') ||
          stack.includes('commitdeletioneffects') ||
          stack.includes('recursivelytraversemutationeffects') ||
          stack.includes('commitMutationEffectsOnFiber') ||
          stack.includes('monaco-editor') ||
          stack.includes('editor.main.js')
        ) {
          // Prevent the error from being logged to console
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      
      console.error('Global error:', error);
      // Could integrate with error reporting service here
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const contextValue: AppContextValue = {
    queryClient,
    isInitialized,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AppContext.Provider>
  );
}

// Hook to use app context
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Loading component for app initialization
export function AppInitializing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Initializing Mermaid Editor
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Setting up your workspace...
        </p>
      </div>
    </div>
  );
}