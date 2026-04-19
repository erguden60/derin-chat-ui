// Validators Tests - Config & URL Validation

import { describe, it, expect, vi } from 'vitest';
import { validateConfig, ConfigError } from './validators.js';
import type { ChatConfig } from '../types';

describe('validateConfig - API URL Validation', () => {
  it('should warn if no apiUrl and not mock mode', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({});

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('UI-only mode')
    );

    consoleWarnSpy.mockRestore();
  });

  it('should accept mock mode without apiUrl', () => {
    expect(() => {
      validateConfig({ mock: true });
    }).not.toThrow();
  });

  it('should reject empty apiUrl', () => {
    expect(() => {
      validateConfig({ apiUrl: '' });
    }).toThrow(ConfigError);

    expect(() => {
      validateConfig({ apiUrl: '   ' });
    }).toThrow('Invalid configuration: apiUrl cannot be empty');
  });

  it('should reject invalid URL format', () => {
    expect(() => {
      validateConfig({ apiUrl: 'not-a-url' });
    }).toThrow(ConfigError);

    expect(() => {
      validateConfig({ apiUrl: 'ftp://example.com' });
    }).toThrow("Invalid configuration: apiUrl must use http or https protocol, got 'ftp:'");
  });

  it('should reject non-http protocols', () => {
    expect(() => {
      validateConfig({ apiUrl: 'ftp://example.com/api' });
    }).toThrow(ConfigError);

    expect(() => {
      validateConfig({ apiUrl: 'file:///path/to/file' });
    }).toThrow("Invalid configuration: apiUrl must use http or https protocol, got 'file:'");
  });

  it('should accept valid http URL', () => {
    expect(() => {
      validateConfig({ apiUrl: 'http://localhost:3000/api' });
    }).not.toThrow();
  });

  it('should accept valid https URL', () => {
    expect(() => {
      validateConfig({ apiUrl: 'https://api.example.com/chat' });
    }).not.toThrow();
  });

  it('should warn if mock mode with apiUrl', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({
      mock: true,
      apiUrl: 'https://example.com',
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Mock mode is active'));

    consoleWarnSpy.mockRestore();
  });
});

describe('validateConfig - UI Validation', () => {
  it('should warn for invalid position', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({
      mock: true,
      ui: { position: 'top-left' as NonNullable<ChatConfig['ui']>['position'] },
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid position value'));

    consoleWarnSpy.mockRestore();
  });

  it('should accept valid positions', () => {
    expect(() => {
      validateConfig({
        mock: true,
        ui: { position: 'bottom-right' },
      });
    }).not.toThrow();

    expect(() => {
      validateConfig({
        mock: true,
        ui: { position: 'bottom-left' },
      });
    }).not.toThrow();
  });

  it('should reject empty instanceId', () => {
    expect(() => {
      validateConfig({
        mock: true,
        instanceId: '   ',
      });
    }).toThrow('Invalid configuration: instanceId must be a non-empty string');
  });

  it('should accept valid target selector and element target', () => {
    const target = document.createElement('div');

    expect(() => {
      validateConfig({
        mock: true,
        target: '#chat-root',
      });
    }).not.toThrow();

    expect(() => {
      validateConfig({
        mock: true,
        target,
      });
    }).not.toThrow();
  });

  it('should reject invalid target values', () => {
    expect(() => {
      validateConfig({
        mock: true,
        target: '' as unknown as HTMLElement,
      });
    }).toThrow('Invalid configuration: target must be a CSS selector string or an HTMLElement');
  });
});

describe('ConfigError Class', () => {
  it('should be instance of Error', () => {
    const error = new ConfigError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have ConfigError name', () => {
    const error = new ConfigError('Test error');
    expect(error.name).toBe('ConfigError');
  });

  it('should preserve error message', () => {
    const message = 'Custom config error';
    const error = new ConfigError(message);
    expect(error.message).toBe(message);
  });
});
