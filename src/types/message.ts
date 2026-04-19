// Message types - Including commercial features

export type MessageSender = 'user' | 'bot' | 'agent' | 'system';

export interface MessageImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface MessageFile {
  url: string;
  name: string;
  size?: number;
  type: 'pdf' | 'doc' | 'image' | 'other';
}

export interface QuickReply {
  label: string;
  value: string;
  icon?: string;
}

export interface MessageAction {
  text: string;
  url?: string;
  action?: string;
}

export interface AgentInfo {
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string; // ISO 8601

  // Commercial features
  image?: MessageImage;
  file?: MessageFile; // File attachment
  quickReplies?: QuickReply[];
  actions?: MessageAction[];
  agent?: AgentInfo;
  
  /** Indicates if the message is currently being streamed (chunk-by-chunk) */
  isStreaming?: boolean;
  
  /** Indicates if the user edited this message */
  isEdited?: boolean;
  
  /** Feedback given by the user ('positive' or 'negative') for advanced tools */
  feedback?: 'positive' | 'negative';
}
