// API types for OpenAI integration and external services

// OpenAI API types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
}

export interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: 'stop' | 'length' | 'content_filter' | 'function_call';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// API configuration
export interface ApiConfig {
  openaiApiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl?: string;
}

export interface ApiUsage {
  tokensUsed: number;
  requestsCount: number;
  lastReset: Date;
  dailyLimit?: number;
}

// HTTP client types
export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpError {
  message: string;
  status?: number;
  code?: string;
  response?: {
    data: unknown;
    status: number;
    statusText: string;
  };
}

// Retry configuration
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential';
  retryCondition?: (error: HttpError) => boolean;
}

// Rate limiting
export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  current: {
    minute: number;
    hour: number;
    day: number;
  };
  resetTimes: {
    minute: Date;
    hour: Date;
    day: Date;
  };
}

// API service interface
export interface ApiService {
  request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: unknown, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: unknown, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
}