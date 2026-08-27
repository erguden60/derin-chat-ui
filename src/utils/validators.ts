// Config validation

import type { AttachmentKind, ChatConfig } from '../types';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

const THEME_VALUES = ['light', 'dark', 'auto'] as const;
const LAYOUT_VALUES = ['normal', 'compact', 'full-screen'] as const;
const POSITION_VALUES = ['bottom-right', 'bottom-left'] as const;
const CONNECTION_MODE_VALUES = ['http', 'websocket', 'auto'] as const;
const ATTACHMENT_KIND_VALUES: AttachmentKind[] = ['image', 'pdf', 'document', 'audio', 'video', 'other'];

function configError(message: string): ConfigError {
  return new ConfigError(`DerinChat config error: ${message}`);
}

function warn(message: string): void {
  console.warn(`DerinChat warning: ${message}`);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatReceived(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

function assertOneOf<T extends readonly string[]>(path: string, value: unknown, allowed: T): void {
  if (value === undefined) return;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw configError(
      `${path} must be one of ${allowed.map((item) => `"${item}"`).join(', ')}. Received: ${formatReceived(value)}.`
    );
  }
}

function assertPositiveNumber(path: string, value: unknown): void {
  if (value === undefined) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw configError(`${path} must be a positive number. Received: ${formatReceived(value)}.`);
  }
}

function assertPositiveInteger(path: string, value: unknown): void {
  if (value === undefined) return;
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw configError(`${path} must be a positive integer. Received: ${formatReceived(value)}.`);
  }
}

function validateHttpUrl(path: string, value: string): void {
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw configError(`${path} must use http or https protocol. Received protocol: "${url.protocol}".`);
    }
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    throw configError(`${path} must be a valid URL. Received: "${value}".`);
  }
}

function validateWebSocketUrl(path: string, value: unknown): void {
  if (!isNonEmptyString(value)) {
    throw configError(`${path} must be a non-empty WebSocket URL when connection.mode is "websocket" or "auto".`);
  }

  try {
    const url = new URL(value.trim());
    if (!['ws:', 'wss:'].includes(url.protocol)) {
      throw configError(`${path} must use ws or wss protocol. Received protocol: "${url.protocol}".`);
    }
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    throw configError(`${path} must be a valid WebSocket URL. Received: "${value}".`);
  }
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function expandHex(value: string): string {
  const clean = value.trim().replace('#', '');
  if (clean.length === 3) {
    return clean.split('').map((char) => char + char).join('');
  }
  return clean;
}

function luminance(hex: string): number | null {
  if (!isHexColor(hex)) return null;
  const clean = expandHex(hex);
  const channels = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number | null {
  const fg = luminance(foreground);
  const bg = luminance(background);
  if (fg === null || bg === null) return null;

  const light = Math.max(fg, bg);
  const dark = Math.min(fg, bg);
  return (light + 0.05) / (dark + 0.05);
}

function warnInvalidColor(path: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (typeof value !== 'string' || !isHexColor(value)) {
    warn(`${path} should be a hex color like "#2563eb". Received: ${formatReceived(value)}.`);
  }
}

function warnLowContrast(label: string, foreground?: string, background?: string): void {
  if (!foreground || !background || !isHexColor(foreground) || !isHexColor(background)) return;

  const ratio = contrastRatio(foreground, background);
  if (ratio !== null && ratio < 4.5) {
    warn(
      `${label} has low contrast ratio ${ratio.toFixed(2)}:1. Recommended minimum is 4.5:1.`
    );
  }
}

function validateMounting(config: ChatConfig): void {
  if (config.instanceId !== undefined) {
    if (!isNonEmptyString(config.instanceId)) {
      throw configError('instanceId must be a non-empty string.');
    }
  }

  if (config.target !== undefined) {
    const isStringTarget = isNonEmptyString(config.target);
    const isElementTarget = typeof Element !== 'undefined' && config.target instanceof Element;

    if (!isStringTarget && !isElementTarget) {
      throw configError('target must be a CSS selector string or an HTMLElement.');
    }
  }
}

function validateNetworking(config: ChatConfig): void {
  if (config.apiUrl !== undefined && config.apiUrl !== null) {
    if (!isNonEmptyString(config.apiUrl)) {
      throw configError('apiUrl cannot be empty.');
    }
    validateHttpUrl('apiUrl', config.apiUrl);
  }

  if (!config.apiUrl && !config.mock) {
    warn("No 'apiUrl' or 'mock' provided. Widget will work in UI-only mode. Messages will not be sent anywhere.");
  }

  if (config.mock && config.apiUrl) {
    warn("Mock mode is active, 'apiUrl' will not be used.");
  }

  if (config.apiKey) {
    warn('apiKey is set in frontend config. Do not expose secret server-side keys in browser bundles.');
  }

  const connection = config.connection;
  if (!connection) return;

  assertOneOf('connection.mode', connection.mode, CONNECTION_MODE_VALUES);

  if (connection.mode === 'websocket' || connection.mode === 'auto') {
    validateWebSocketUrl('connection.websocket.url', connection.websocket?.url);
  } else if (connection.websocket?.url) {
    validateWebSocketUrl('connection.websocket.url', connection.websocket.url);
  }

  if (connection.websocket?.headers && typeof window !== 'undefined') {
    warn('connection.websocket.headers was provided, but browser WebSocket APIs cannot send custom headers.');
  }
}

function validateUi(config: ChatConfig): void {
  const ui = config.ui;
  if (!ui) return;

  if (ui.position && !POSITION_VALUES.includes(ui.position)) {
    warn(`ui.position should be one of "bottom-right" or "bottom-left". Received: ${formatReceived(ui.position)}. Defaults will handle fallback.`);
  }

  assertOneOf('ui.theme', ui.theme, THEME_VALUES);
  assertOneOf('ui.layout', ui.layout, LAYOUT_VALUES);
  assertPositiveNumber('ui.fileUpload.maxSize', ui.fileUpload?.maxSize);

  const colors = ui.colors;
  if (!colors) return;

  Object.entries(colors).forEach(([key, value]) => warnInvalidColor(`ui.colors.${key}`, value));

  warnLowContrast('ui.colors.headerText/headerBg', colors.headerText, colors.headerBg);
  warnLowContrast('ui.colors.botMessageText/botMessageBg', colors.botMessageText, colors.botMessageBg);
  warnLowContrast('ui.colors.userMessageText/userMessageBg', colors.userMessageText, colors.userMessageBg);
  warnLowContrast('ui.colors.inputText/inputBg', colors.inputText, colors.inputBg);
}

function validateAttachments(config: ChatConfig): void {
  const attachments = config.attachments;
  if (!attachments) return;

  assertPositiveNumber('attachments.maxSize', attachments.maxSize);

  if (attachments.types === undefined) return;
  if (!Array.isArray(attachments.types)) {
    throw configError('attachments.types must be an array.');
  }

  attachments.types.forEach((type, index) => {
    const path = `attachments.types[${index}]`;
    if (!type || typeof type !== 'object') {
      throw configError(`${path} must be an object.`);
    }

    if (!isNonEmptyString(type.id)) {
      throw configError(`${path}.id must be a non-empty string.`);
    }
    if (!isNonEmptyString(type.label)) {
      throw configError(`${path}.label must be a non-empty string.`);
    }
    if (!isNonEmptyString(type.accept)) {
      throw configError(`${path}.accept must be a non-empty string.`);
    }
    if (type.kind !== undefined && !ATTACHMENT_KIND_VALUES.includes(type.kind)) {
      throw configError(
        `${path}.kind must be one of ${ATTACHMENT_KIND_VALUES.map((kind) => `"${kind}"`).join(', ')}. Received: ${formatReceived(type.kind)}.`
      );
    }
  });
}

function validateBehavior(config: ChatConfig): void {
  assertPositiveInteger('behavior.maxMessages', config.behavior?.maxMessages);
}

export function validateConfig(config: ChatConfig): void {
  validateMounting(config);
  validateNetworking(config);
  validateUi(config);
  validateAttachments(config);
  validateBehavior(config);
}
