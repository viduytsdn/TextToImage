import { FormEvent, useEffect, useMemo, useState } from 'react';

export type PromptComposerPayload = {
  prompt: string;
  useCustomApi: boolean;
};

type PromptComposerProps = {
  globalUsageEnabled: boolean;
  onSubmit: (payload: PromptComposerPayload) => void;
};

const PromptComposer = ({ globalUsageEnabled, onSubmit }: PromptComposerProps) => {
  const [prompt, setPrompt] = useState('');
  const [customApiEnabled, setCustomApiEnabled] = useState(globalUsageEnabled);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setCustomApiEnabled(globalUsageEnabled);
  }, [globalUsageEnabled]);

  const promptError = useMemo(() => {
    if (!touched) return '';
    if (!prompt.trim()) {
      return 'Enter a prompt to generate an image.';
    }
    return '';
  }, [prompt, touched]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (!prompt.trim()) {
      return;
    }

    onSubmit({
      prompt: prompt.trim(),
      useCustomApi: customApiEnabled
    });
    setPrompt('');
    setTouched(false);
  };

  return (
    <form className="prompt-composer" onSubmit={handleSubmit}>
      <div className="composer-header">
        <h2>Prompt composer</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={customApiEnabled}
            onChange={(event) => setCustomApiEnabled(event.target.checked)}
          />
          <span>Use custom API for this prompt</span>
        </label>
      </div>
      <div className="field">
        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          name="prompt"
          rows={6}
          placeholder="Describe the image you want to create..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={Boolean(promptError)}
          aria-describedby={promptError ? 'prompt-error' : undefined}
          required
        />
        {promptError ? (
          <p id="prompt-error" className="error-text" role="alert">
            {promptError}
          </p>
        ) : null}
      </div>
      <button type="submit" className="primary-button">
        Submit prompt
      </button>
      <p className="field-hint" role="status">
        This toggle applies only to the next submission. Global settings stay {globalUsageEnabled ? 'enabled' : 'disabled'}.
      </p>
    </form>
  );
};

export default PromptComposer;
