import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, Theme, LayoutState, PanelConfig } from '../types';
import { ApiKeyState } from '../types/chat';
import { DEFAULT_SETTINGS, resolveTheme, applyTheme } from '../constants/themes';
import { saveSettings, getSettings, saveApiKey, getApiKey, removeApiKey, saveLayout, getLayout } from '../utils/storage';

interface SettingsStore {
  // App settings
  settings: AppSettings;
  
  // Layout state
  layout: LayoutState;
  
  // API key management
  apiKey: ApiKeyState;
  
  // Actions for settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: number) => void;
  toggleLineNumbers: () => void;
  toggleWordWrap: () => void;
  toggleMinimap: () => void;
  resetSettings: () => void;
  
  // Actions for layout
  updateLayout: (layout: Partial<LayoutState>) => void;
  updatePanelConfig: (panel: keyof LayoutState, config: Partial<PanelConfig>) => void;
  togglePanelVisibility: (panel: keyof LayoutState) => void;
  resetLayout: () => void;
  
  // Actions for API key
  setApiKey: (key: string) => Promise<boolean>;
  validateApiKey: () => Promise<boolean>;
  clearApiKey: () => void;
  updateApiKeyState: (state: Partial<ApiKeyState>) => void;
}

const DEFAULT_LAYOUT: LayoutState = {
  editor: { isVisible: true, size: 40 },
  preview: { isVisible: true, size: 40 },
  chat: { isVisible: false, size: 20 }
};

const INITIAL_API_KEY_STATE: ApiKeyState = {
  hasKey: false,
  isValid: undefined,
  lastValidated: undefined
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      layout: DEFAULT_LAYOUT,
      apiKey: {
        ...INITIAL_API_KEY_STATE,
        hasKey: !!getApiKey()
      },

      // Settings actions
      updateSettings: (newSettings) => {
        const updatedSettings = { ...get().settings, ...newSettings };
        set({ settings: updatedSettings });
        
        // Apply theme if it changed
        if (newSettings.theme) {
          const resolvedTheme = resolveTheme(newSettings.theme);
          applyTheme(resolvedTheme);
        }
        
        // Persist to localStorage
        saveSettings(updatedSettings);
      },

      setTheme: (theme) => {
        get().updateSettings({ theme });
      },

      setFontSize: (fontSize) => {
        if (fontSize >= 10 && fontSize <= 24) {
          get().updateSettings({ fontSize });
        }
      },

      toggleLineNumbers: () => {
        const { settings } = get();
        get().updateSettings({ showLineNumbers: !settings.showLineNumbers });
      },

      toggleWordWrap: () => {
        const { settings } = get();
        get().updateSettings({ wordWrap: !settings.wordWrap });
      },

      toggleMinimap: () => {
        const { settings } = get();
        get().updateSettings({ minimap: !settings.minimap });
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
        saveSettings(DEFAULT_SETTINGS);
        
        // Apply default theme
        const resolvedTheme = resolveTheme(DEFAULT_SETTINGS.theme);
        applyTheme(resolvedTheme);
      },

      // Layout actions
      updateLayout: (newLayout) => {
        const updatedLayout = { ...get().layout, ...newLayout };
        set({ layout: updatedLayout });
        saveLayout(updatedLayout);
      },

      updatePanelConfig: (panel, config) => {
        const { layout } = get();
        const updatedLayout = {
          ...layout,
          [panel]: { ...layout[panel], ...config }
        };
        set({ layout: updatedLayout });
        saveLayout(updatedLayout);
      },

      togglePanelVisibility: (panel) => {
        const { layout } = get();
        const currentPanel = layout[panel];
        get().updatePanelConfig(panel, { isVisible: !currentPanel.isVisible });
      },

      resetLayout: () => {
        set({ layout: DEFAULT_LAYOUT });
        saveLayout(DEFAULT_LAYOUT);
      },

      // API key actions
      setApiKey: async (key) => {
        try {
          const success = saveApiKey(key);
          if (success) {
            set({
              apiKey: {
                hasKey: true,
                isValid: undefined, // Will be validated separately
                lastValidated: undefined
              }
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to save API key:', error);
          return false;
        }
      },

      validateApiKey: async () => {
        const key = getApiKey();
        if (!key) {
          set({
            apiKey: {
              hasKey: false,
              isValid: false,
              lastValidated: new Date()
            }
          });
          return false;
        }

        try {
          // Note: Actual validation would be done by the OpenAI service
          // For now, we just check if the key exists and has a reasonable format
          const isValidFormat = key.startsWith('sk-') && key.length > 20;
          
          set({
            apiKey: {
              hasKey: true,
              isValid: isValidFormat,
              lastValidated: new Date()
            }
          });
          
          return isValidFormat;
        } catch (error) {
          console.error('API key validation failed:', error);
          set({
            apiKey: {
              hasKey: true,
              isValid: false,
              lastValidated: new Date()
            }
          });
          return false;
        }
      },

      clearApiKey: () => {
        removeApiKey();
        set({ apiKey: INITIAL_API_KEY_STATE });
      },

      updateApiKeyState: (state) => {
        set({
          apiKey: { ...get().apiKey, ...state }
        });
      }
    }),
    {
      name: 'mermaid-editor-settings',
      partialize: (state) => ({
        settings: state.settings,
        layout: state.layout
        // Don't persist API key state - it's managed separately for security
      })
    }
  )
);

// Selector hooks for optimized component re-renders
export const useAppSettings = () => useSettingsStore(state => state.settings);
export const useLayoutState = () => useSettingsStore(state => state.layout);
export const useApiKeyState = () => useSettingsStore(state => state.apiKey);
export const useTheme = () => useSettingsStore(state => state.settings.theme);

// Specific panel hooks
export const useEditorPanel = () => useSettingsStore(state => state.layout.editor);
export const usePreviewPanel = () => useSettingsStore(state => state.layout.preview);
export const useChatPanel = () => useSettingsStore(state => state.layout.chat);

// Initialize theme on store creation
const initialTheme = resolveTheme(useSettingsStore.getState().settings.theme);
applyTheme(initialTheme);

// Validate API key on initialization
if (useSettingsStore.getState().apiKey.hasKey) {
  useSettingsStore.getState().validateApiKey();
}