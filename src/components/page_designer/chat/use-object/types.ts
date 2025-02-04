export interface Message {
  prompt: string;
  response: string;
  timestamp?: number;
  attachments?: File[];
} 