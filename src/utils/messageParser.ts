// Message parser - Converts API response to Message object

import type { ApiResponse, Message, MessageSender } from '../types';
import type { ChatConfig } from '../types';
import { generateId } from './helpers';

export function parseApiResponse(response: ApiResponse, config: Required<ChatConfig>): Message {
  const format = config.messageFormat;

  // Get values with field mapping
  const text = String(getNestedValue(response, format.textField) || response.reply || '');
  const image = (getNestedValue(response, format.imageField) || response.image) as Message['image'];
  const quickReplies = (getNestedValue(response, format.quickRepliesField) ||
    response.quickReplies) as Message['quickReplies'];
  const actions = (getNestedValue(response, format.actionsField) ||
    response.actions) as Message['actions'];
  const agent = (getNestedValue(response, format.agentField) || response.agent) as Message['agent'];
  const type = getNestedValue(response, format.typeField) || response.type || 'bot';

  // Normalize sender to valid MessageSender type
  const sender: MessageSender =
    type === 'agent' || type === 'system' || type === 'user' ? type : 'bot';

  return {
    id: generateId(),
    text,
    sender,
    timestamp: new Date().toISOString(),
    ...(config.features?.images && image ? { image } : {}),
    ...(config.features?.quickReplies && quickReplies ? { quickReplies } : {}),
    ...(actions ? { actions } : {}),
    ...(config.features?.agentMode && agent ? { agent } : {}),
  };
}

// Nested field accessor (e.g., "data.message.text")
function getNestedValue(obj: unknown, path: string | undefined): unknown {
  if (!path) return undefined;

  return path.split('.').reduce<unknown>((current, key) => {
    if (typeof current !== 'object' || current === null) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

// Mock response generator - Generic placeholder for testing
export function generateMockResponse(userMessage: string): Message {
  if (userMessage.toLowerCase().includes('payment')) {
    return {
      id: generateId(),
      sender: 'bot',
      timestamp: new Date().toISOString(),
      text: `Sure, here is your secure payment link:\n[PAYMENT_LINK]\n\nThank you!`,
    };
  }

  return {
    id: generateId(),
    sender: 'bot',
    timestamp: new Date().toISOString(),
    text: `Received: "${userMessage}"`,
  };
}
