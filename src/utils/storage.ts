import { DiagramData, StorageKey, STORAGE_KEYS } from '../types';

/**
 * Local storage utility functions with type safety and error handling
 */

// Generic storage operations
export function getFromStorage<T>(key: StorageKey, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get item from localStorage (${key}):`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set item in localStorage (${key}):`, error);
    return false;
  }
}

export function removeFromStorage(key: StorageKey): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove item from localStorage (${key}):`, error);
    return false;
  }
}

export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

// Diagram-specific storage operations
export function saveDiagram(diagram: DiagramData): boolean {
  const diagrams = getSavedDiagrams();
  const existingIndex = diagrams.findIndex(d => d.id === diagram.id);
  
  if (existingIndex >= 0) {
    diagrams[existingIndex] = { ...diagram, updatedAt: new Date() };
  } else {
    diagrams.push(diagram);
  }
  
  return setToStorage(STORAGE_KEYS.DIAGRAMS, diagrams);
}

export function getSavedDiagrams(): DiagramData[] {
  const diagrams = getFromStorage<DiagramData[]>(STORAGE_KEYS.DIAGRAMS, []);
  // Convert date strings back to Date objects
  return diagrams.map(diagram => ({
    ...diagram,
    createdAt: new Date(diagram.createdAt),
    updatedAt: new Date(diagram.updatedAt)
  }));
}

export function deleteDiagram(id: string): boolean {
  const diagrams = getSavedDiagrams();
  const filteredDiagrams = diagrams.filter(d => d.id !== id);
  return setToStorage(STORAGE_KEYS.DIAGRAMS, filteredDiagrams);
}

export function getDiagramById(id: string): DiagramData | null {
  const diagrams = getSavedDiagrams();
  return diagrams.find(d => d.id === id) || null;
}

// Settings storage
export function saveSettings(settings: Record<string, unknown>): boolean {
  return setToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function getSettings<T extends Record<string, unknown>>(defaultSettings: T): T {
  return getFromStorage<T>(STORAGE_KEYS.SETTINGS, defaultSettings);
}

// API key storage (with encryption consideration)
export function saveApiKey(apiKey: string): boolean {
  // In a production app, you'd want to encrypt this
  // For now, we'll just store it directly
  return setToStorage(STORAGE_KEYS.API_KEY, apiKey);
}

export function getApiKey(): string | null {
  return getFromStorage<string | null>(STORAGE_KEYS.API_KEY, null);
}

export function removeApiKey(): boolean {
  return removeFromStorage(STORAGE_KEYS.API_KEY);
}

// Layout storage
export function saveLayout(layout: Record<string, unknown> | object): boolean {
  return setToStorage(STORAGE_KEYS.LAYOUT, layout);
}

export function getLayout<T extends Record<string, unknown>>(defaultLayout: T): T {
  return getFromStorage<T>(STORAGE_KEYS.LAYOUT, defaultLayout);
}

// Storage size utilities
export function getStorageSize(): { used: number; available: number } {
  let used = 0;
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }
  } catch (error) {
    console.warn('Failed to calculate storage size:', error);
  }
  
  // Most browsers have a 5-10MB limit for localStorage
  const available = 5 * 1024 * 1024; // 5MB estimate
  
  return { used, available };
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}