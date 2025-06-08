import { useCallback } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { chatService } from '../services/chatService';
import { debounce } from '../utils/debounce';
import { DiagramData, MermaidValidationResult } from '../types';

/**
 * Custom hook for managing diagram content, validation, and operations
 */
export function useDiagram() {
  const {
    currentDiagram,
    editorState,
    validationResult,
    isLoading,
    isSaving,
    savedDiagrams,
    setCurrentDiagram,
    updateDiagramContent,
    setEditorState,
    setValidationResult,
    createNewDiagram,
    saveDiagramToStorage,
    loadDiagram,
    deleteDiagramFromStorage,
    duplicateDiagram,
    resetEditor,
    setLoading,
    setSaving,
    loadSavedDiagrams
  } = useDiagramStore();

  // Debounced validation function
  const validateDiagram = useCallback(
    debounce(async (content: string) => {
      if (!content.trim()) {
        setValidationResult({
          isValid: false,
          error: { message: 'Diagram cannot be empty' }
        });
        return;
      }

      try {
        const result = await chatService.validateDiagram(content);
        setValidationResult({
          isValid: result.isValid,
          error: result.errors.length > 0 ? { message: result.errors[0] } : undefined,
          warnings: result.errors.slice(1)
        });
      } catch (error) {
        setValidationResult({
          isValid: false,
          error: { 
            message: error instanceof Error ? error.message : 'Validation failed' 
          }
        });
      }
    }, 500),
    [setValidationResult]
  );

  // Update diagram content with validation
  const updateContent = useCallback((content: string) => {
    updateDiagramContent(content);
    validateDiagram(content);
  }, [updateDiagramContent, validateDiagram]);

  // Update cursor position
  const updateCursorPosition = useCallback((position: number) => {
    setEditorState({ cursorPosition: position });
  }, [setEditorState]);

  // Create new diagram with optional template
  const createNew = useCallback((name?: string, template?: string) => {
    createNewDiagram(name);
    if (template) {
      updateContent(template);
    }
  }, [createNewDiagram, updateContent]);

  // Save current diagram
  const save = useCallback(async (): Promise<boolean> => {
    if (!currentDiagram) return false;
    
    try {
      setSaving(true);
      return await saveDiagramToStorage();
    } finally {
      setSaving(false);
    }
  }, [currentDiagram, saveDiagramToStorage, setSaving]);

  // Load diagram by ID
  const load = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      return await loadDiagram(id);
    } finally {
      setLoading(false);
    }
  }, [loadDiagram, setLoading]);

  // Delete diagram
  const deleteDiagram = useCallback(async (id: string): Promise<boolean> => {
    return await deleteDiagramFromStorage(id);
  }, [deleteDiagramFromStorage]);

  // Duplicate diagram
  const duplicate = useCallback(async (id: string): Promise<boolean> => {
    return await duplicateDiagram(id);
  }, [duplicateDiagram]);

  // Update diagram name
  const updateName = useCallback((name: string) => {
    if (currentDiagram) {
      const updatedDiagram: DiagramData = {
        ...currentDiagram,
        name,
        updatedAt: new Date()
      };
      setCurrentDiagram(updatedDiagram);
    }
  }, [currentDiagram, setCurrentDiagram]);

  // Reset to default state
  const reset = useCallback(() => {
    resetEditor();
  }, [resetEditor]);

  // Clear current diagram (alias for reset)
  const clearDiagram = useCallback(() => {
    resetEditor();
  }, [resetEditor]);

  // Auto-validate when content changes
  // useEffect(() => {
  //   if (editorState.content) {
  //     validateDiagram(editorState.content);
  //   }
  // }, [editorState.content, validateDiagram]);
  
  return {
    // State
    diagram: currentDiagram,
    content: editorState.content,
    cursorPosition: editorState.cursorPosition,
    isValid: editorState.isValid,
    error: editorState.error,
    validationResult,
    isLoading,
    isSaving,
    savedDiagrams,
    
    // Actions
    updateContent,
    updateCursorPosition,
    updateName,
    createNew,
    save,
    load,
    loadDiagram: load,
    deleteDiagram,
    duplicate,
    reset,
    clearDiagram,
    
    // Additional methods needed by components
    saveDiagram: save,
    currentDiagram: currentDiagram,
    
    // Validation
    validateDiagram: (content: string) => validateDiagram(content)
  };
}