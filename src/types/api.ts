// API Response and Request types

import type { MessageImage, QuickReply, MessageAction, AgentInfo } from './message';

// Response format from backend
export interface ApiResponse {
  reply: string;
  image?: MessageImage;
  quickReplies?: QuickReply[];
  actions?: MessageAction[];
  agent?: AgentInfo;
  type?: 'bot' | 'agent' | 'system';
  timestamp?: string;
}

// Request format sent to backend
export interface ApiRequest {
  message: string;
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
    hash?: string; // HMAC hash
    metadata?: Record<string, unknown>;
  };
  history?: Array<{
    text: string;
    sender: 'user' | 'bot' | 'agent' | 'system';
    timestamp: string; // ISO 8601
  }>;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string; // base64
  };
  sessionId?: string;
}

// API Mapping Configuration
export interface ApiMessageFormat {
  textField?: string;
  imageField?: string;
  quickRepliesField?: string;
  actionsField?: string;
  agentField?: string;
  typeField?: string;
}
