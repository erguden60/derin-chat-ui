// Config merge ve validation utilities

import type { ChatConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants/defaults';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  if (typeof Element !== 'undefined' && value instanceof Element) {
    return false;
  }

  return true;
}

// Deep merge helper
function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...target };

  for (const key in source) {
    // Prototype pollution protection
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = result[key];

    if (isPlainObject(sourceValue)) {
      result[key] = deepMerge(isPlainObject(targetValue) ? targetValue : {}, sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }

  return result as T;
}

// Config merge with defaults
export function mergeConfig(userConfig: ChatConfig): Required<ChatConfig> {
  const merged = deepMerge(
    DEFAULT_CONFIG as unknown as Record<string, unknown>,
    userConfig as unknown as Record<string, unknown>
  ) as Required<ChatConfig>;
  
  // Set default voice language dynamically if voice features are enabled
  if (merged.features?.voice) {
    merged.features.voice.language = merged.features.voice.language || 'en-US';
  }
  
  return merged;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate session ID
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
