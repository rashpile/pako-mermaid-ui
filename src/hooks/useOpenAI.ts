import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { openAIService } from '../services/openaiService';
import { ApiKeyValidationResult } from '../types/chat';
import { getApiKey } from '../utils/storage';
import { useDebouncedCallback } from './useDebounce';

/**
 * Custom hook for managing OpenAI API integration
 */
export function useOpenAI() {
  const { apiKey: apiKeyState, updateApiKeyState, setApiKey: setApiKeyInStore } = useSettingsStore();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if API key is configured
  const hasApiKey = apiKeyState.hasKey;
  const isValidKey = apiKeyState.isValid;
  const lastValidated = apiKeyState.lastValidated;

  // Validate API key with debouncing to prevent excessive requests
  const validateApiKey = useDebouncedCallback(
    useCallback(async (): Promise<ApiKeyValidationResult> => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const isValid = await openAIService.validateApiKey();
        const result: ApiKeyValidationResult = {
          isValid,
          error: isValid ? undefined : 'Invalid API key or insufficient permissions'
        };

        updateApiKeyState({
          isValid,
          lastValidated: new Date()
        });

        if (!isValid) {
          setValidationError(result.error || 'API key validation failed');
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Validation failed';
        const result: ApiKeyValidationResult = {
          isValid: false,
          error: errorMessage
        };

        updateApiKeyState({
          isValid: false,
          lastValidated: new Date()
        });

        setValidationError(errorMessage);
        return result;
      } finally {
        setIsValidating(false);
      }
    }, [updateApiKeyState]),
    1000
  );

  // Set new API key
  const setApiKey = useCallback(async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      setValidationError('API key cannot be empty');
      return false;
    }

    try {
      // Save to store and storage
      const success = await setApiKeyInStore(key);
      if (success) {
        // Reset validation state
        updateApiKeyState({
          hasKey: true,
          isValid: undefined,
          lastValidated: undefined
        });
        
        // Reset service to use new key
        openAIService.reset();
        
        // Validate the new key
        await validateApiKey();
        return true;
      }
      return false;
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to set API key');
      return false;
    }
  }, [setApiKeyInStore, updateApiKeyState, validateApiKey]);

  // Remove API key
  const removeApiKey = useCallback(() => {
    try {
      removeApiKey();
      updateApiKeyState({
        hasKey: false,
        isValid: undefined,
        lastValidated: undefined
      });
      openAIService.reset();
      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to remove API key');
      return false;
    }
  }, [updateApiKeyState]);

  // Get API key from storage (for debugging/verification)
  const getCurrentApiKey = useCallback((): string | null => {
    return getApiKey();
  }, []);

  // Check if API key needs validation (older than 1 hour)
  const needsValidation = useCallback((): boolean => {
    if (!hasApiKey || isValidKey === false) return false;
    if (!lastValidated) return true;
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastValidated < oneHourAgo;
  }, [hasApiKey, isValidKey, lastValidated]);

  // Auto-validate API key on component mount and periodically
  useEffect(() => {
    if (hasApiKey && needsValidation()) {
      validateApiKey();
    }
  }, [hasApiKey, needsValidation, validateApiKey]);

  // Validate API key format (basic client-side check)
  const validateApiKeyFormat = useCallback((key: string): boolean => {
    if (!key) return false;
    
    // OpenAI API keys typically start with 'sk-' and are at least 20 characters
    return key.startsWith('sk-') && key.length >= 20;
  }, []);

  // Get service status
  const getServiceStatus = useCallback(() => {
    return {
      isConfigured: hasApiKey,
      isValid: isValidKey,
      isValidating,
      needsValidation: needsValidation(),
      lastValidated,
      error: validationError,
      isServiceReady: hasApiKey && isValidKey === true && !isValidating
    };
  }, [hasApiKey, isValidKey, isValidating, needsValidation, lastValidated, validationError]);

  // Format API key for display (mask most characters)
  const formatApiKeyForDisplay = useCallback((key?: string): string => {
    const apiKey = key || getCurrentApiKey();
    if (!apiKey) return 'Not set';
    
    if (apiKey.length < 8) return '***';
    return `${apiKey.slice(0, 3)}...${apiKey.slice(-4)}`;
  }, [getCurrentApiKey]);

  return {
    // State
    hasApiKey,
    isValidKey,
    isValidating,
    validationError,
    lastValidated,
    
    // Actions
    setApiKey,
    removeApiKey: removeApiKey,
    validateApiKey,
    
    // Utilities
    validateApiKeyFormat,
    needsValidation,
    getServiceStatus,
    formatApiKeyForDisplay,
    getCurrentApiKey,
    
    // Computed values
    isReady: hasApiKey && isValidKey === true,
    statusMessage: (() => {
      if (!hasApiKey) return 'API key not configured';
      if (isValidating) return 'Validating API key...';
      if (isValidKey === false) return validationError || 'Invalid API key';
      if (isValidKey === true) return 'API key valid';
      return 'API key not validated';
    })()
  };
}

/**
 * Hook for managing OpenAI service configuration
 */
export function useOpenAIConfig() {
  const { isReady } = useOpenAI();
  
  // Get current configuration
  const getConfig = useCallback(() => {
    return openAIService.getConfig();
  }, []);

  // Update service configuration
  const updateConfig = useCallback((config: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) => {
    if (isReady) {
      openAIService.updateConfig(config);
    }
  }, [isReady]);

  // Get available models
  const getAvailableModels = useCallback(() => {
    return [
      { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster and more efficient' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' }
    ];
  }, []);

  return {
    isReady,
    getConfig,
    updateConfig,
    getAvailableModels,
    currentConfig: getConfig()
  };
}