// Config merge ve validation utilities

import type { ChatConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants/defaults';

// Deep merge helper
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    // Prototype pollution protection
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = result[key];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(targetValue || ({} as any), sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any;
    }
  }

  return result;
}

// Config merge with defaults
export function mergeConfig(userConfig: ChatConfig): Required<ChatConfig> {
  return deepMerge(DEFAULT_CONFIG as any, userConfig) as Required<ChatConfig>;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate session ID
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
