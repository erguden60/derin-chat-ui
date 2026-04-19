// Config validation

import type { ChatConfig } from '../types';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function validateConfig(config: ChatConfig): void {
  if (config.instanceId !== undefined) {
    if (typeof config.instanceId !== 'string' || !config.instanceId.trim()) {
      throw new ConfigError('Invalid configuration: instanceId must be a non-empty string');
    }
  }

  if (config.target !== undefined) {
    const isStringTarget = typeof config.target === 'string' && config.target.trim().length > 0;
    const isElementTarget =
      typeof Element !== 'undefined' && config.target instanceof Element;

    if (!isStringTarget && !isElementTarget) {
      throw new ConfigError(
        'Invalid configuration: target must be a CSS selector string or an HTMLElement'
      );
    }
  }

  // Check if apiUrl is explicitly provided but empty
  if (config.apiUrl !== undefined && config.apiUrl !== null && typeof config.apiUrl === 'string') {
    const trimmedUrl = config.apiUrl.trim();
    
    if (!trimmedUrl) {
      throw new ConfigError('Invalid configuration: apiUrl cannot be empty');
    }

    try {
      const url = new URL(trimmedUrl);
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new ConfigError(
          `Invalid configuration: apiUrl must use http or https protocol, got '${url.protocol}'`
        );
      }
    } catch (error) {
      if (error instanceof ConfigError) throw error;
      throw new ConfigError(`Invalid configuration: apiUrl is not a valid URL - ${config.apiUrl}`);
    }
  }

  // Warn if no backend is configured (but don't block)
  if (!config.apiUrl && !config.mock) {
    console.warn(
      "⚠️ DerinChat Warning: No 'apiUrl' or 'mock' provided. Widget will work in UI-only mode. Messages will not be sent anywhere."
    );
  }

  // Warning: API URL in mock mode
  if (config.mock && config.apiUrl) {
    console.warn("⚠️ DerinChat Warning: Mock mode is active, 'apiUrl' will not be used.");
  }

  // Position validation
  if (config.ui?.position && !['bottom-right', 'bottom-left'].includes(config.ui.position)) {
    console.warn(
      `⚠️ DerinChat Warning: Invalid position value '${config.ui.position}'. Defaults will handle fallback.`
    );
  }
}
