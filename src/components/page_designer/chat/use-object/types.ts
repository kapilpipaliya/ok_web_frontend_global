export interface DBMessage {
  prompt: string;
  response: string;
  data?: string;
  timestamp?: number;
  contentPreview?: string;
  // Commenting out attachments for now since Files can't be stored in DB
  // The file handling functionality can be revisited later when we have a proper solution for file storage.
  // attachments?: File[]; 
} 