import { useState } from 'react';
import CustomApiPanel from './components/CustomApiPanel';
import PromptComposer from './components/PromptComposer';
import { useCustomApiSettings } from './hooks/useCustomApiSettings';

const App = () => {
  const {
    settings,
    updateSettings,
    updateUsageOptions,
    toggleGlobalUsage
  } = useCustomApiSettings();
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Text-to-Image Studio</h1>
        <p>Configure your custom API integration and compose prompts with fine-grained control.</p>
      </header>
      <main className="layout-grid">
        <section>
          <CustomApiPanel
            settings={settings}
            onSettingsChange={updateSettings}
            onUsageOptionsChange={updateUsageOptions}
            onGlobalUsageToggle={toggleGlobalUsage}
          />
        </section>
        <section>
          <PromptComposer
            globalUsageEnabled={settings.useCustomApi}
            onSubmit={(payload) => {
              setLastSubmission(JSON.stringify(payload, null, 2));
            }}
          />
          <div className="submission-log">
            <h2>Last submission payload</h2>
            <pre aria-live="polite">{lastSubmission ?? 'No prompts submitted yet.'}</pre>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
