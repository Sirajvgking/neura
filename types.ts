export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: Attachment[];
  generatedImages?: Attachment[];
  timestamp: number;
  isStreaming?: boolean;
  groundingSources?: GroundingSource[];
  error?: boolean;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  updatedAt: number;
}

export enum ModelId {
  Gemini25Flash = 'gemini-2.5-flash',
  Gemini3ProPreview = 'gemini-3-pro-preview',
  Gemini25FlashImage = 'gemini-2.5-flash-image',
}

export interface AIConfig {
  modelId: ModelId;
  useSearch: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}