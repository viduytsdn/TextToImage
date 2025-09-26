export interface EnhancementPreset {
  id: string;
  label: string;
  description?: string;
  promptEnhancement: (prompt: string) => string;
}

export interface ImageSizeOption {
  label: string;
  width: number;
  height: number;
}

export interface PromptRequestPayload {
  prompt: string;
  basePrompt: string;
  enhancementId: string | null;
  nanoBanana: boolean;
  width: number;
  height: number;
}
