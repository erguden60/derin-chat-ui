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
    }).toThrow('DerinChat config error: apiUrl cannot be empty.');
  });

  it('should reject invalid URL format', () => {
    expect(() => {
      validateConfig({ apiUrl: 'not-a-url' });
    }).toThrow(ConfigError);

    expect(() => {
      validateConfig({ apiUrl: 'ftp://example.com' });
    }).toThrow('DerinChat config error: apiUrl must use http or https protocol. Received protocol: "ftp:".');
  });

  it('should reject non-http protocols', () => {
    expect(() => {
      validateConfig({ apiUrl: 'ftp://example.com/api' });
    }).toThrow(ConfigError);

    expect(() => {
      validateConfig({ apiUrl: 'file:///path/to/file' });
    }).toThrow('DerinChat config error: apiUrl must use http or https protocol. Received protocol: "file:".');
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

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ui.position should be one of'));

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
    }).toThrow('DerinChat config error: instanceId must be a non-empty string.');
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
    }).toThrow('DerinChat config error: target must be a CSS selector string or an HTMLElement.');
  });

  it('should reject invalid theme', () => {
    expect(() => {
      validateConfig({
        mock: true,
        ui: { theme: 'black' as NonNullable<ChatConfig['ui']>['theme'] },
      });
    }).toThrow('ui.theme must be one of "light", "dark", "auto"');
  });

  it('should reject invalid layout', () => {
    expect(() => {
      validateConfig({
        mock: true,
        ui: { layout: 'wide' as NonNullable<ChatConfig['ui']>['layout'] },
      });
    }).toThrow('ui.layout must be one of "normal", "compact", "full-screen"');
  });

  it('should warn for invalid hex colors', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({
      mock: true,
      ui: {
        colors: {
          primary: 'blue',
        },
      },
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ui.colors.primary should be a hex color'));
    consoleWarnSpy.mockRestore();
  });

  it('should warn for low contrast color pairs', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({
      mock: true,
      ui: {
        colors: {
          inputText: '#777777',
          inputBg: '#777777',
        },
      },
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ui.colors.inputText/inputBg has low contrast ratio'));
    consoleWarnSpy.mockRestore();
  });
});

describe('validateConfig - Connection Validation', () => {
  it('should reject invalid connection mode', () => {
    expect(() => {
      validateConfig({
        mock: true,
        connection: { mode: 'socket' as NonNullable<ChatConfig['connection']>['mode'] },
      });
    }).toThrow('connection.mode must be one of "http", "websocket", "auto"');
  });

  it('should require websocket url for websocket mode', () => {
    expect(() => {
      validateConfig({
        mock: true,
        connection: { mode: 'websocket' },
      });
    }).toThrow('connection.websocket.url must be a non-empty WebSocket URL');
  });

  it('should require websocket url for auto mode', () => {
    expect(() => {
      validateConfig({
        mock: true,
        connection: { mode: 'auto' },
      });
    }).toThrow('connection.websocket.url must be a non-empty WebSocket URL');
  });

  it('should reject non-websocket protocols for websocket url', () => {
    expect(() => {
      validateConfig({
        mock: true,
        connection: {
          mode: 'websocket',
          websocket: { url: 'https://example.com/ws' },
        },
      });
    }).toThrow('connection.websocket.url must use ws or wss protocol');
  });

  it('should accept ws and wss websocket urls', () => {
    expect(() => {
      validateConfig({
        mock: true,
        connection: {
          mode: 'websocket',
          websocket: { url: 'ws://localhost:3000/ws' },
        },
      });
    }).not.toThrow();

    expect(() => {
      validateConfig({
        mock: true,
        connection: {
          mode: 'auto',
          websocket: { url: 'wss://example.com/ws' },
        },
      });
    }).not.toThrow();
  });

  it('should warn for apiKey in browser config', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({
      mock: true,
      apiKey: 'secret',
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('apiKey is set in frontend config'));
    consoleWarnSpy.mockRestore();
  });

  it('should warn for websocket headers in browser config', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateConfig({
      mock: true,
      connection: {
        mode: 'websocket',
        websocket: {
          url: 'wss://example.com/ws',
          headers: { Authorization: 'Bearer token' },
        },
      },
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('browser WebSocket APIs cannot send custom headers'));
    consoleWarnSpy.mockRestore();
  });
});

describe('validateConfig - Attachments and Behavior Validation', () => {
  it('should reject invalid attachments.types', () => {
    expect(() => {
      validateConfig({
        mock: true,
        attachments: { types: 'image' as unknown as NonNullable<ChatConfig['attachments']>['types'] },
      });
    }).toThrow('attachments.types must be an array');
  });

  it('should reject missing attachment fields', () => {
    expect(() => {
      validateConfig({
        mock: true,
        attachments: {
          types: [{ id: '', label: 'Image', accept: 'image/*', kind: 'image' }],
        },
      });
    }).toThrow('attachments.types[0].id must be a non-empty string');

    expect(() => {
      validateConfig({
        mock: true,
        attachments: {
          types: [{ id: 'image', label: '', accept: 'image/*', kind: 'image' }],
        },
      });
    }).toThrow('attachments.types[0].label must be a non-empty string');

    expect(() => {
      validateConfig({
        mock: true,
        attachments: {
          types: [{ id: 'image', label: 'Image', accept: '', kind: 'image' }],
        },
      });
    }).toThrow('attachments.types[0].accept must be a non-empty string');
  });

  it('should reject invalid attachment kind', () => {
    expect(() => {
      validateConfig({
        mock: true,
        attachments: {
          types: [{ id: 'image', label: 'Image', accept: 'image/*', kind: 'binary' as never }],
        },
      });
    }).toThrow('attachments.types[0].kind must be one of');
  });

  it('should reject invalid max sizes', () => {
    expect(() => {
      validateConfig({
        mock: true,
        attachments: { maxSize: 0 },
      });
    }).toThrow('attachments.maxSize must be a positive number');

    expect(() => {
      validateConfig({
        mock: true,
        ui: { fileUpload: { maxSize: -1 } },
      });
    }).toThrow('ui.fileUpload.maxSize must be a positive number');
  });

  it('should reject invalid behavior.maxMessages', () => {
    expect(() => {
      validateConfig({
        mock: true,
        behavior: { maxMessages: 1.5 },
      });
    }).toThrow('behavior.maxMessages must be a positive integer');

    expect(() => {
      validateConfig({
        mock: true,
        behavior: { maxMessages: 0 },
      });
    }).toThrow('behavior.maxMessages must be a positive integer');
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
