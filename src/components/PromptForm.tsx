import React, { FormEvent } from 'react';
import { usePromptForm } from '../hooks/usePromptForm';
import { EnhancementPreset, ImageSizeOption, PromptRequestPayload } from '../types/prompt';

export interface PromptFormProps {
  presets: EnhancementPreset[];
  sizeOptions: ImageSizeOption[];
  maxPromptLength?: number;
  defaultNanoBanana?: boolean;
  onSubmit: (payload: PromptRequestPayload) => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({
  presets,
  sizeOptions,
  maxPromptLength,
  defaultNanoBanana = false,
  onSubmit,
}) => {
  const {
    prompt,
    setPrompt,
    selectedPresetId,
    setSelectedPresetId,
    nanoBanana,
    setNanoBanana,
    selectedSize,
    setSelectedSize,
    errors,
    enhancedPrompt,
    payload,
    maxPromptLength: limit,
    handleSubmit,
  } = usePromptForm({
    presets,
    sizeOptions,
    maxPromptLength,
    defaultNanoBanana,
  });

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit(onSubmit);
  };

  const characterCount = prompt.trim().length;
  const characterLimit = maxPromptLength ?? limit;

  return (
    <form className="prompt-form" onSubmit={onFormSubmit} noValidate>
      <fieldset>
        <legend>Prompt</legend>
        <label htmlFor="prompt-input" className="prompt-form__label">
          Describe the image you want to generate
        </label>
        <textarea
          id="prompt-input"
          name="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          aria-describedby="prompt-help prompt-error"
          maxLength={characterLimit}
          required
        />
        <div className="prompt-form__meta">
          <small id="prompt-help">
            {characterCount}/{characterLimit} characters used
          </small>
          {errors.prompt && (
            <small id="prompt-error" role="alert" className="prompt-form__error">
              {errors.prompt}
            </small>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>Enhancement preset</legend>
        <div className="prompt-form__enhancements">
          {presets.map((preset) => (
            <label key={preset.id} className="prompt-form__enhancement-option">
              <input
                type="radio"
                name="enhancement"
                value={preset.id}
                checked={selectedPresetId === preset.id}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                required
              />
              <span className="prompt-form__enhancement-label">{preset.label}</span>
              {preset.description && (
                <span className="prompt-form__enhancement-description">
                  {preset.description}
                </span>
              )}
            </label>
          ))}
        </div>
        {errors.enhancementId && (
          <small role="alert" className="prompt-form__error">
            {errors.enhancementId}
          </small>
        )}
      </fieldset>

      <fieldset>
        <legend>Nano Banana</legend>
        <label className="prompt-form__toggle">
          <input
            type="checkbox"
            checked={nanoBanana}
            onChange={(event) => setNanoBanana(event.target.checked)}
          />
          <span>Activate Nano Banana prompt boost</span>
        </label>
      </fieldset>

      <fieldset>
        <legend>Image size</legend>
        <select
          name="imageSize"
          value={selectedSize ? `${selectedSize.width}x${selectedSize.height}` : ''}
          onChange={(event) => {
            const [width, height] = event.target.value.split('x').map(Number);
            const matchedOption = sizeOptions.find(
              (option) => option.width === width && option.height === height,
            );
            if (matchedOption) {
              setSelectedSize(matchedOption);
            }
          }}
          required
        >
          <option value="" disabled>
            Choose a size
          </option>
          {sizeOptions.map((option) => (
            <option
              key={`${option.width}x${option.height}`}
              value={`${option.width}x${option.height}`}
            >
              {option.label} ({option.width}×{option.height})
            </option>
          ))}
        </select>
        {errors.size && (
          <small role="alert" className="prompt-form__error">
            {errors.size}
          </small>
        )}
      </fieldset>

      <section className="prompt-form__preview">
        <h2>Enhanced prompt preview</h2>
        <pre>
          {enhancedPrompt || prompt || 'Your enhanced prompt will appear here once you begin typing.'}
        </pre>
      </section>

      <section className="prompt-form__payload">
        <h2>Gemini request payload</h2>
        <pre>
          {payload
            ? JSON.stringify(payload, null, 2)
            : 'Complete the form to see the payload that will be sent to Gemini.'}
        </pre>
      </section>

      <button type="submit" className="prompt-form__submit">
        Generate with Gemini
      </button>
    </form>
  );
};

export default PromptForm;
