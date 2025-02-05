export interface DBMessage {
  prompt: string;
  response: string;
  data?: string;
  timestamp?: number;
  attachments?: File[];
} 