import { useState, useEffect, useCallback } from 'react';
import { 
  getFromStorage, 
  setToStorage, 
  removeFromStorage, 
  isStorageAvailable 
} from '../utils/storage';
import { StorageKey } from '../types';

/**
 * Custom hook for managing localStorage with React state synchronization
 */
export function useLocalStorage<T>(
  key: StorageKey,
  defaultValue: T
): [T, (value: T) => void, () => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return defaultValue;
    }
    return getFromStorage(key, defaultValue);
  });

  const [isReady, setIsReady] = useState(false);

  // Initialize storage availability check
  useEffect(() => {
    setIsReady(isStorageAvailable());
  }, []);

  // Update localStorage when value changes
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (isStorageAvailable()) {
        setToStorage(key, value);
      }
    } catch (error) {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
  }, [key]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (isStorageAvailable()) {
        removeFromStorage(key);
      }
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (!isStorageAvailable()) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error('Failed to parse storage event value:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue, isReady];
}

/**
 * Specialized hook for managing boolean localStorage values
 */
export function useLocalStorageBoolean(
  key: StorageKey,
  defaultValue = false
): [boolean, () => void, () => void, (value: boolean) => void] {
  const [value, setValue, , isReady] = useLocalStorage(key, defaultValue);

  const toggle = useCallback(() => {
    setValue(!value);
  }, [value, setValue]);

  const setTrue = useCallback(() => {
    setValue(true);
  }, [setValue]);

  return [value, toggle, isReady ? setTrue : () => {}, setValue];
}

/**
 * Hook for managing array values in localStorage with utility methods
 */
export function useLocalStorageArray<T>(
  key: StorageKey,
  defaultValue: T[] = []
): {
  items: T[];
  addItem: (item: T) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: T) => void;
  clearItems: () => void;
  setItems: (items: T[]) => void;
  isReady: boolean;
} {
  const [items, setItems, , isReady] = useLocalStorage(key, defaultValue);

  const addItem = useCallback((item: T) => {
    setItems([...items, item]);
  }, [items, setItems]);

  const removeItem = useCallback((index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  }, [items, setItems]);

  const updateItem = useCallback((index: number, item: T) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  }, [items, setItems]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems,
    isReady
  };
}

/**
 * Hook for managing object values in localStorage with deep merge capabilities
 */
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: StorageKey,
  defaultValue: T
): {
  object: T;
  updateProperty: <K extends keyof T>(property: K, value: T[K]) => void;
  updateProperties: (updates: Partial<T>) => void;
  resetObject: () => void;
  setObject: (object: T) => void;
  isReady: boolean;
} {
  const [object, setObject, , isReady] = useLocalStorage(key, defaultValue);

  const updateProperty = useCallback(<K extends keyof T>(property: K, value: T[K]) => {
    setObject({ ...object, [property]: value });
  }, [object, setObject]);

  const updateProperties = useCallback((updates: Partial<T>) => {
    setObject({ ...object, ...updates });
  }, [object, setObject]);

  const resetObject = useCallback(() => {
    setObject(defaultValue);
  }, [setObject, defaultValue]);

  return {
    object,
    updateProperty,
    updateProperties,
    resetObject,
    setObject,
    isReady
  };
}