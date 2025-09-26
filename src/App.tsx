import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

type ImageResult = {
  id: string;
  alt: string;
  url: string;
};

const MAX_INTERACTIONS_HINT = `Tip: Submit a prompt, toggle Nano Banana if needed, and review results – all within three simple interactions.`;

function createImageMock(prompt: string, index: number, nanoBanana: boolean): ImageResult {
  const safePrompt = encodeURIComponent(prompt.trim() || 'nano+banana+art');
  const style = nanoBanana ? 'nano-banana' : 'standard';
  const id = `${Date.now()}-${index}-${style}`;
  return {
    id,
    alt: `${nanoBanana ? 'Nano Banana' : 'Standard'} render for “${prompt || 'untitled'}” variation ${index + 1}`,
    url: `https://dummyimage.com/600x400/0f172a/ffffff.png&text=${safePrompt}+${style}+v${index + 1}`
  };
}

function useFocusOnResults<T extends HTMLElement>(items: T[], status: 'idle' | 'pending' | 'done'): void {
  useEffect(() => {
    if (items.length === 0 || status !== 'done') {
      return;
    }

    items[0]?.focus({ preventScroll: true });
  }, [items, status]);
}

function useImageResults(prompt: string, nanoBanana: boolean) {
  return useMemo(() => {
    return Array.from({ length: 3 }, (_, index) => createImageMock(prompt, index, nanoBanana));
  }, [prompt, nanoBanana]);
}

const toggleLabelId = 'nano-banana-label';
const statusMessageId = 'generation-status';

const STORAGE_KEY = 'text-to-image.recent-prompts';

export default function App() {
  const [prompt, setPrompt] = useState('A playful robot sketching with neon markers');
  const [nanoBanana, setNanoBanana] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'done'>('idle');
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored) as string[];
      return parsed.slice(0, 5);
    } catch (error) {
      console.warn('Failed to parse recent prompts', error);
      return [];
    }
  });
  const [submittedPrompt, setSubmittedPrompt] = useState(prompt);
  const generatedImages = useImageResults(submittedPrompt, nanoBanana);
  const galleryItemRefs = useRef<HTMLAnchorElement[]>([]);
  galleryItemRefs.current = [];

  useFocusOnResults(galleryItemRefs.current, status);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const promptValue = ((formData.get('prompt') as string | null) ?? '').trim();

    if (!promptValue) {
      return;
    }

    setStatus('pending');
    setPrompt(promptValue);
    setSubmittedPrompt(promptValue);
    setHistory((prev) => {
      const updated = [promptValue, ...prev.filter((item) => item !== promptValue)];
      return updated.slice(0, 5);
    });
    setStatus('done');
  };

  const handlePromptShortcut = (nextPrompt: string) => {
    setPrompt(nextPrompt);
    const form = document.getElementById('prompt-form') as HTMLFormElement | null;
    if (form?.requestSubmit) {
      form.requestSubmit();
    } else {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  };

  const statusMessage =
    status === 'pending'
      ? 'Generating fresh artwork…'
      : status === 'done'
      ? `Generated ${generatedImages.length} visuals for “${submittedPrompt}”.`
      : 'Ready when you are. Describe an image to start generating visuals.';

  return (
    <div className="app-shell" aria-labelledby="app-title">
      <header className="hero" role="banner">
        <div className="hero__content">
          <p className="eyebrow" aria-live="polite" aria-atomic="true">
            {MAX_INTERACTIONS_HINT}
          </p>
          <h1 id="app-title">Text to Image Studio</h1>
          <p className="hero__subtitle">
            Craft vivid imagery in moments. Submit your prompt, boost it with Nano Banana, and instantly curate a shareable
            gallery tailored for any screen size.
          </p>
        </div>
      </header>

      <main className="workspace" aria-describedby={statusMessageId}>
        <section className="panel" aria-label="Prompt controls">
          <form id="prompt-form" className="prompt-form" onSubmit={handleSubmit}>
            <label className="prompt-form__label" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={3}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              aria-describedby={`${statusMessageId} ${toggleLabelId}`}
              aria-label="Describe the image you want to generate"
              required
            />

            <div className="prompt-form__actions">
              <div className="toggle" role="group" aria-labelledby={toggleLabelId}>
                <label id={toggleLabelId} htmlFor="nano-banana-toggle">
                  Nano Banana enhancer
                </label>
                <div className="toggle__control">
                  <input
                    id="nano-banana-toggle"
                    type="checkbox"
                    role="switch"
                    checked={nanoBanana}
                    onChange={(event) => setNanoBanana(event.target.checked)}
                    aria-checked={nanoBanana}
                  />
                  <span aria-hidden="true">{nanoBanana ? 'On' : 'Off'}</span>
                </div>
                <p className="toggle__description">
                  {nanoBanana
                    ? 'Enhancement active: high saturation, whimsical lighting, and playful proportions applied.'
                    : 'Enable for dynamic lighting, extra color grading, and playful Nano Banana styling.'}
                </p>
              </div>

              <button type="submit" className="primary-action" aria-describedby={statusMessageId}>
                Generate gallery
              </button>
            </div>
          </form>

          <div className="prompt-history" aria-live="polite">
            <h2 id="recent-prompts-heading">Recent prompts</h2>
            {history.length === 0 ? (
              <p className="prompt-history__empty">Your recent prompts will appear here for one-tap reuse.</p>
            ) : (
              <ul aria-labelledby="recent-prompts-heading">
                {history.map((recent) => (
                  <li key={recent}>
                    <button type="button" onClick={() => handlePromptShortcut(recent)}>
                      {recent}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="panel gallery" aria-label="Generated gallery">
          <h2 className="gallery__title">Latest results</h2>
          <p id={statusMessageId} role="status" aria-live="polite" aria-atomic="true">
            {statusMessage}
          </p>
          <ul className="gallery__grid" aria-label="Generated gallery">
            {generatedImages.map((image, index) => (
              <li key={image.id} className="gallery__item">
                <a
                  href={image.url}
                  target="_blank"
                  rel="noreferrer"
                  ref={(element) => {
                    if (element) {
                      galleryItemRefs.current[index] = element;
                    }
                  }}
                  className="gallery__card"
                >
                  <figure>
                    <img src={image.url} alt={image.alt} loading="lazy" />
                    <figcaption>
                      {index === 0 ? 'Primary inspiration' : `Variation ${index + 1}`} · {nanoBanana ? 'Nano Banana' : 'Standard'}
                      {' '}flair
                    </figcaption>
                  </figure>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
