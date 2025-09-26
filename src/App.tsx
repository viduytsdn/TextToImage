import React, { useCallback, useState } from 'react';
import PromptForm from './components/PromptForm';
import { EnhancementPreset, ImageSizeOption, PromptRequestPayload } from './types/prompt';

const enhancementPresets: EnhancementPreset[] = [
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Adds dramatic lighting and depth for filmic shots.',
    promptEnhancement: (prompt) =>
      `${prompt}\n\nEnhance with ultra-wide cinematic composition, volumetric lighting, and rich color grading.`,
  },
  {
    id: 'illustrative',
    label: 'Illustrative',
    description: 'Great for stylised drawings and concept art.',
    promptEnhancement: (prompt) =>
      `${prompt}\n\nRender as a high-detail digital illustration with crisp linework and painterly shading.`,
  },
  {
    id: 'photoreal',
    label: 'Photo-realistic',
    description: 'Optimised for lifelike photography outputs.',
    promptEnhancement: (prompt) =>
      `${prompt}\n\nGenerate with photo-realistic textures, natural light, and shallow depth of field.`,
  },
];

const imageSizes: ImageSizeOption[] = [
  { label: 'Square', width: 1024, height: 1024 },
  { label: 'Portrait', width: 1024, height: 1344 },
  { label: 'Landscape', width: 1344, height: 1024 },
];

const App: React.FC = () => {
  const [lastRequest, setLastRequest] = useState<PromptRequestPayload | null>(null);

  const handleSubmit = useCallback((payload: PromptRequestPayload) => {
    setLastRequest(payload);
    // This is where the Gemini request would be triggered.
    // fetch('/api/gemini', { method: 'POST', body: JSON.stringify(payload) }) ...
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Text to Image Playground</h1>
        <p>Create an expressive prompt, choose an enhancement, and toggle Nano Banana for extra flair.</p>
      </header>
      <PromptForm
        presets={enhancementPresets}
        sizeOptions={imageSizes}
        maxPromptLength={600}
        defaultNanoBanana
        onSubmit={handleSubmit}
      />
      {lastRequest && (
        <section className="app__last-request">
          <h2>Last submitted payload</h2>
          <pre>{JSON.stringify(lastRequest, null, 2)}</pre>
        </section>
      )}
    </div>
  );
};

export default App;
