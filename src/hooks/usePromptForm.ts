import { useCallback, useMemo, useState } from 'react';
import {
  EnhancementPreset,
  ImageSizeOption,
  PromptRequestPayload,
} from '../types/prompt';

export interface PromptFormErrors {
  prompt?: string;
  enhancementId?: string;
  size?: string;
}

export interface UsePromptFormOptions {
  presets: EnhancementPreset[];
  sizeOptions: ImageSizeOption[];
  maxPromptLength?: number;
  defaultNanoBanana?: boolean;
}

const DEFAULT_MAX_PROMPT_LENGTH = 600;

export const usePromptForm = ({
  presets,
  sizeOptions,
  maxPromptLength = DEFAULT_MAX_PROMPT_LENGTH,
  defaultNanoBanana = false,
}: UsePromptFormOptions) => {
  const [prompt, setPrompt] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    presets.length === 1 ? presets[0].id : null,
  );
  const [nanoBanana, setNanoBanana] = useState(defaultNanoBanana);
  const [selectedSize, setSelectedSize] = useState<ImageSizeOption | null>(
    sizeOptions.length > 0 ? sizeOptions[0] : null,
  );
  const [errors, setErrors] = useState<PromptFormErrors>({});

  const trimmedPrompt = useMemo(() => prompt.trim(), [prompt]);

  const presetMap = useMemo(
    () => new Map(presets.map((preset) => [preset.id, preset])),
    [presets],
  );

  const selectedPreset = useMemo(
    () => (selectedPresetId ? presetMap.get(selectedPresetId) ?? null : null),
    [presetMap, selectedPresetId],
  );

  const enhancedPrompt = useMemo(() => {
    if (!trimmedPrompt) {
      return '';
    }

    let workingPrompt = trimmedPrompt;

    if (selectedPreset) {
      workingPrompt = selectedPreset.promptEnhancement(trimmedPrompt);
    }

    if (nanoBanana) {
      workingPrompt = `${workingPrompt}\n\nNano Banana Boost: please emphasize playful yellow highlights, whimsical lighting, and a vibrant surreal tone.`;
    }

    return workingPrompt;
  }, [nanoBanana, selectedPreset, trimmedPrompt]);

  const payload = useMemo<PromptRequestPayload | null>(() => {
    if (!trimmedPrompt || !selectedSize) {
      return null;
    }

    return {
      prompt: enhancedPrompt || trimmedPrompt,
      basePrompt: trimmedPrompt,
      enhancementId: selectedPresetId,
      nanoBanana,
      width: selectedSize.width,
      height: selectedSize.height,
    };
  }, [
    enhancedPrompt,
    nanoBanana,
    selectedPresetId,
    selectedSize,
    trimmedPrompt,
  ]);

  const validate = useCallback(() => {
    const nextErrors: PromptFormErrors = {};

    if (!trimmedPrompt) {
      nextErrors.prompt = 'Enter a prompt to begin generating an image.';
    } else if (trimmedPrompt.length > maxPromptLength) {
      nextErrors.prompt = `Prompt must be ${maxPromptLength} characters or fewer.`;
    }

    if (presets.length > 0 && !selectedPresetId) {
      nextErrors.enhancementId = 'Choose an enhancement preset to continue.';
    }

    if (!selectedSize) {
      nextErrors.size = 'Select an image size.';
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [
    maxPromptLength,
    presets.length,
    selectedPresetId,
    selectedSize,
    trimmedPrompt,
  ]);

  const handlePromptChange = useCallback(
    (value: string) => {
      setPrompt(value);
      setErrors((prev) => ({
        ...prev,
        prompt: undefined,
      }));
    },
    [setPrompt],
  );

  const handlePresetChange = useCallback((value: string) => {
    setSelectedPresetId(value);
    setErrors((prev) => ({
      ...prev,
      enhancementId: undefined,
    }));
  }, []);

  const handleSizeChange = useCallback((option: ImageSizeOption) => {
    setSelectedSize(option);
    setErrors((prev) => ({
      ...prev,
      size: undefined,
    }));
  }, []);

  const handleSubmit = useCallback(
    (onSubmit: (request: PromptRequestPayload) => void) => {
      const validation = validate();
      const hasErrors = Object.keys(validation).length > 0;

      if (hasErrors || !payload) {
        return false;
      }

      onSubmit(payload);
      return true;
    },
    [payload, validate],
  );

  return {
    prompt,
    setPrompt: handlePromptChange,
    selectedPresetId,
    setSelectedPresetId: handlePresetChange,
    nanoBanana,
    setNanoBanana,
    selectedSize,
    setSelectedSize: handleSizeChange,
    errors,
    validate,
    enhancedPrompt,
    payload,
    maxPromptLength,
    handleSubmit,
  };
};
