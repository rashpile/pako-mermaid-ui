import { create } from 'zustand';
import { DiagramData, EditorState, MermaidValidationResult } from '../types';
import { saveDiagram, getSavedDiagrams, deleteDiagram, getDiagramById } from '../utils/storage';
import { DEFAULT_DIAGRAM } from '../constants/examples';

interface DiagramStore {
  // Current diagram state
  currentDiagram: DiagramData | null;
  editorState: EditorState;
  
  // Saved diagrams
  savedDiagrams: DiagramData[];
  
  // Validation state
  validationResult: MermaidValidationResult | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  setCurrentDiagram: (diagram: DiagramData | null) => void;
  updateDiagramContent: (content: string) => void;
  setEditorState: (state: Partial<EditorState>) => void;
  setValidationResult: (result: MermaidValidationResult | null) => void;
  
  // Diagram management
  createNewDiagram: (name?: string) => void;
  saveDiagramToStorage: () => Promise<boolean>;
  loadDiagram: (id: string) => Promise<boolean>;
  loadSavedDiagrams: () => void;
  deleteDiagramFromStorage: (id: string) => Promise<boolean>;
  duplicateDiagram: (id: string) => Promise<boolean>;
  
  // Utility actions
  resetEditor: () => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

const createInitialDiagram = (name: string = 'Untitled Diagram'): DiagramData => ({
  id: generateId(),
  name,
  content: DEFAULT_DIAGRAM,
  created: new Date(),
  createdAt: new Date(),
  lastModified: new Date(),
  updatedAt: new Date()
});

const createInitialEditorState = (): EditorState => ({
  content: DEFAULT_DIAGRAM,
  cursorPosition: 0,
  isValid: true
});

function generateId(): string {
  return `diagram_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export const useDiagramStore = create<DiagramStore>()((set, get) => ({
    // Initial state
    currentDiagram: createInitialDiagram(),
    editorState: createInitialEditorState(),
    savedDiagrams: [],
    validationResult: null,
    isLoading: false,
    isSaving: false,

    // Basic setters
    setCurrentDiagram: (diagram) => {
      set({ currentDiagram: diagram });
      if (diagram) {
        set({ 
          editorState: { 
            content: diagram.content, 
            cursorPosition: 0, 
            isValid: true 
          } 
        });
      }
    },

    updateDiagramContent: (content) => {
      console.log('[DiagramStore] updateDiagramContent called with:', content?.substring(0, 100) + '...');
      const { currentDiagram } = get();
      if (currentDiagram) {
        const updatedDiagram = {
          ...currentDiagram,
          content,
          lastModified: new Date(),
          updatedAt: new Date()
        };
        console.log('[DiagramStore] Updating store with new content');
        set({ 
          currentDiagram: updatedDiagram,
          editorState: { ...get().editorState, content }
        });
        console.log('[DiagramStore] Store updated successfully');
      } else {
        console.log('[DiagramStore] No current diagram to update');
      }
    },

    setEditorState: (state) => {
      set({ 
        editorState: { ...get().editorState, ...state } 
      });
    },

    setValidationResult: (result) => {
      set({ 
        validationResult: result,
        editorState: { 
          ...get().editorState, 
          isValid: result ? result.isValid : true,
          error: result?.error?.message
        }
      });
    },

    // Diagram management
    createNewDiagram: (name = 'Untitled Diagram') => {
      const newDiagram = createInitialDiagram(name);
      set({ 
        currentDiagram: newDiagram,
        editorState: createInitialEditorState()
      });
    },

    saveDiagramToStorage: async () => {
      const { currentDiagram } = get();
      if (!currentDiagram) return false;

      set({ isSaving: true });
      
      try {
        const success = saveDiagram(currentDiagram);
        if (success) {
          // Refresh saved diagrams list
          get().loadSavedDiagrams();
        }
        return success;
      } catch (error) {
        console.error('Failed to save diagram:', error);
        return false;
      } finally {
        set({ isSaving: false });
      }
    },

    loadDiagram: async (id) => {
      set({ isLoading: true });
      
      try {
        const diagram = getDiagramById(id);
        if (diagram) {
          set({ 
            currentDiagram: diagram,
            editorState: {
              content: diagram.content,
              cursorPosition: 0,
              isValid: true
            }
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to load diagram:', error);
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    loadSavedDiagrams: () => {
      try {
        const diagrams = getSavedDiagrams();
        set({ savedDiagrams: diagrams });
      } catch (error) {
        console.error('Failed to load saved diagrams:', error);
        set({ savedDiagrams: [] });
      }
    },

    deleteDiagramFromStorage: async (id) => {
      try {
        const success = deleteDiagram(id);
        if (success) {
          // Remove from saved diagrams list
          const { savedDiagrams, currentDiagram } = get();
          set({ 
            savedDiagrams: savedDiagrams.filter(d => d.id !== id)
          });
          
          // If the deleted diagram was currently open, create a new one
          if (currentDiagram?.id === id) {
            get().createNewDiagram();
          }
        }
        return success;
      } catch (error) {
        console.error('Failed to delete diagram:', error);
        return false;
      }
    },

    duplicateDiagram: async (id) => {
      try {
        const originalDiagram = getDiagramById(id);
        if (!originalDiagram) return false;

        const duplicatedDiagram: DiagramData = {
          ...originalDiagram,
          id: generateId(),
          name: `${originalDiagram.name} (Copy)`,
          created: new Date(),
          createdAt: new Date(),
          lastModified: new Date(),
          updatedAt: new Date()
        };

        const success = saveDiagram(duplicatedDiagram);
        if (success) {
          get().loadSavedDiagrams();
        }
        return success;
      } catch (error) {
        console.error('Failed to duplicate diagram:', error);
        return false;
      }
    },

    // Utility actions
    resetEditor: () => {
      set({
        currentDiagram: createInitialDiagram(),
        editorState: createInitialEditorState(),
        validationResult: null
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setSaving: (saving) => set({ isSaving: saving })
  }));

// Selector hooks for optimized component re-renders
export const useCurrentDiagram = () => useDiagramStore(state => state.currentDiagram);
export const useEditorState = () => useDiagramStore(state => state.editorState);
export const useSavedDiagrams = () => useDiagramStore(state => state.savedDiagrams);
export const useValidationResult = () => useDiagramStore(state => state.validationResult);
export const useDiagramLoading = () => useDiagramStore(state => ({ 
  isLoading: state.isLoading, 
  isSaving: state.isSaving 
}));

// Initialize saved diagrams on store creation
useDiagramStore.getState().loadSavedDiagrams();