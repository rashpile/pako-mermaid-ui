// Core application types and interfaces

// Diagram-related types
export interface DiagramData {
  id: string;
  name: string;
  content: string;
  description?: string;
  created: Date;
  createdAt: Date;
  lastModified: Date;
  updatedAt: Date;
}

export interface EditorState {
  content: string;
  cursorPosition: number;
  isValid: boolean;
  error?: string;
}

export interface MermaidError {
  message: string;
  line?: number;
  column?: number;
}

export interface MermaidValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  warnings?: string[];
}

// Export formats
export type ExportFormat = 'svg';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  quality?: number; // For PNG exports
  scale?: number;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  fontSize: number;
  showLineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
}

// Layout types
export interface PanelConfig {
  isVisible: boolean;
  size: number; // percentage
}

export interface LayoutState {
  editor: PanelConfig;
  preview: PanelConfig;
  chat: PanelConfig;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Modal and dialog types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Local storage keys
export const STORAGE_KEYS = {
  DIAGRAMS: 'mermaid-editor-diagrams',
  SETTINGS: 'mermaid-editor-settings',
  LAYOUT: 'mermaid-editor-layout',
  API_KEY: 'mermaid-editor-api-key',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];