// API utilities with retry logic

import type { ApiRequest, ApiResponse } from '../types';
import { API_CONFIG } from '../constants/defaults';

export class ApiError extends Error {
  public statusCode?: number;
  public response?: unknown;

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout');
    }
    throw error;
  }
}

// Retry logic
async function retryFetch(
  url: string,
  options: RequestInit,
  attempts: number = API_CONFIG.retryAttempts
): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      if (i === attempts - 1) throw error;

      // Exponential backoff
      const delay = API_CONFIG.retryDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new ApiError('All retry attempts failed');
}

// Main API call function
export async function sendMessage(
  url: string,
  request: ApiRequest,
  apiKey?: string,
  signal?: AbortSignal
): Promise<ApiResponse> {
  try {
    const response = await retryFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(request),
      signal, // Pass the abort signal
    });

    if (!response.ok) {
      // Try to capture error body for better debugging
      let errorBody: unknown = undefined;
      try {
        errorBody = await response.json();
      } catch {
        // Ignore if response body is not JSON
      }

      throw new ApiError(`API Error: ${response.statusText}`, response.status, errorBody);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Unknown error');
  }
}
