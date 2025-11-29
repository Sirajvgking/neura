import { ModelId } from './types';

export const MODELS = [
  {
    id: ModelId.Gemini25Flash,
    name: 'Fast',
    description: 'Gemini 2.5 Flash',
    icon: '⚡',
  },
  {
    id: ModelId.Gemini3ProPreview,
    name: 'Pro',
    description: 'Gemini 3 Pro',
    icon: '🧠',
  },
  {
    id: ModelId.Gemini25FlashImage,
    name: 'Image',
    description: 'Gemini Image',
    icon: '🎨',
  },
];

export const DEFAULT_CONFIG = {
  modelId: ModelId.Gemini25Flash,
  useSearch: false,
};

export const PLACEHOLDER_QUESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python script to scrape a website",
  "Plan a 3-day trip to Tokyo",
  "Generate an image of a futuristic city",
];