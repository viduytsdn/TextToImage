import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import ProtectedSection from './ProtectedSection';
import { CustomApiSettings, UsageOptions } from '../hooks/useCustomApiSettings';

type CustomApiPanelProps = {
  settings: CustomApiSettings;
  onSettingsChange: (patch: Partial<Omit<CustomApiSettings, 'usageOptions'>>) => void;
  onUsageOptionsChange: (usageOptions: UsageOptions) => void;
  onGlobalUsageToggle: (nextValue: boolean) => void;
};

type ValidationErrors = Partial<Record<'endpointUrl' | 'authKey' | 'authValue', string>>;

const urlIsValid = (url: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return Boolean(parsed.protocol && parsed.host);
  } catch (error) {
    return false;
  }
};

const CustomApiPanel = ({ settings, onSettingsChange, onUsageOptionsChange, onGlobalUsageToggle }: CustomApiPanelProps) => {
  const [touched, setTouched] = useState<Record<keyof ValidationErrors, boolean>>({
    endpointUrl: false,
    authKey: false,
    authValue: false
  });
  const [justSaved, setJustSaved] = useState(false);

  const errors: ValidationErrors = useMemo(() => {
    const nextErrors: ValidationErrors = {};
    if (!urlIsValid(settings.endpointUrl)) {
      nextErrors.endpointUrl = settings.endpointUrl
        ? 'Enter a valid https:// URL.'
        : 'Endpoint URL is required.';
    }
    if (settings.useCustomApi || settings.endpointUrl) {
      if (!settings.authKey.trim()) {
        nextErrors.authKey = 'Header or query key is required when using a custom API.';
      }
      if (!settings.authValue.trim()) {
        nextErrors.authValue = 'Provide the secret or token that matches the key above.';
      }
    }
    return nextErrors;
  }, [settings]);

  useEffect(() => {
    setJustSaved(true);
    const timeout = window.setTimeout(() => setJustSaved(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [settings]);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof CustomApiSettings
  ) => {
    const value = event.target.value;
    onSettingsChange({ [field]: value } as Partial<CustomApiSettings>);
  };

  const setTouchedField = (field: keyof ValidationErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const usageOptions = settings.usageOptions;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <ProtectedSection
      title="Custom API configuration"
      description="The custom API settings are locked by default. Unlock them when you need to configure or update sensitive credentials."
      storageKey="custom-api-panel"
    >
      <form className="panel-form" onSubmit={(event) => event.preventDefault()} noValidate>
        <div className="form-header">
          <p>
            Configure how the studio calls your custom text-to-image API. Changes are saved locally to this browser.
          </p>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.useCustomApi}
              onChange={(event) => onGlobalUsageToggle(event.target.checked)}
            />
            <span>Enable custom API globally</span>
          </label>
        </div>

        <div className="field">
          <label htmlFor="endpointUrl">Endpoint URL</label>
          <input
            id="endpointUrl"
            name="endpointUrl"
            type="url"
            placeholder="https://api.example.com/v1/generate"
            value={settings.endpointUrl}
            onChange={(event) => handleFieldChange(event, 'endpointUrl')}
            onBlur={() => setTouchedField('endpointUrl')}
            aria-invalid={touched.endpointUrl && Boolean(errors.endpointUrl)}
            aria-describedby={errors.endpointUrl ? 'endpointUrl-error' : undefined}
            required
          />
          {touched.endpointUrl && errors.endpointUrl ? (
            <p id="endpointUrl-error" className="error-text" role="alert">
              {errors.endpointUrl}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="authPlacement">Credential placement</label>
          <select
            id="authPlacement"
            name="authPlacement"
            value={settings.authPlacement}
            onChange={(event) => handleFieldChange(event, 'authPlacement')}
          >
            <option value="header">HTTP header</option>
            <option value="query">Query string</option>
          </select>
          <p className="field-hint">
            Choose where the credential should be added when calling your endpoint.
          </p>
        </div>

        <div className="grid-two">
          <div className="field">
            <label htmlFor="authKey">Header or parameter name</label>
            <input
              id="authKey"
              name="authKey"
              type="text"
              placeholder="Authorization"
              value={settings.authKey}
              onChange={(event) => handleFieldChange(event, 'authKey')}
              onBlur={() => setTouchedField('authKey')}
              aria-invalid={touched.authKey && Boolean(errors.authKey)}
              aria-describedby={errors.authKey ? 'authKey-error' : undefined}
              required={settings.useCustomApi}
            />
            {touched.authKey && errors.authKey ? (
              <p id="authKey-error" className="error-text" role="alert">
                {errors.authKey}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="authValue">Secret or token</label>
            <input
              id="authValue"
              name="authValue"
              type="password"
              placeholder="Bearer sk-..."
              value={settings.authValue}
              onChange={(event) => handleFieldChange(event, 'authValue')}
              onBlur={() => setTouchedField('authValue')}
              aria-invalid={touched.authValue && Boolean(errors.authValue)}
              aria-describedby={errors.authValue ? 'authValue-error' : undefined}
              required={settings.useCustomApi}
            />
            {touched.authValue && errors.authValue ? (
              <p id="authValue-error" className="error-text" role="alert">
                {errors.authValue}
              </p>
            ) : null}
          </div>
        </div>

        <fieldset className="usage-options">
          <legend>Usage options</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={usageOptions.sendPrompt}
              onChange={(event) =>
                onUsageOptionsChange({ ...usageOptions, sendPrompt: event.target.checked })
              }
            />
            <span>Send prompt text to the custom API</span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={usageOptions.sendMetadata}
              onChange={(event) =>
                onUsageOptionsChange({ ...usageOptions, sendMetadata: event.target.checked })
              }
            />
            <span>Include user metadata (for auditing)</span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={usageOptions.allowImageUpscale}
              onChange={(event) =>
                onUsageOptionsChange({ ...usageOptions, allowImageUpscale: event.target.checked })
              }
            />
            <span>Allow Nano Banana upscaling</span>
          </label>
        </fieldset>

        <div className="form-footer" role="status" aria-live="polite">
          {hasErrors ? (
            <span className="error-text">Resolve the validation errors above to finish setup.</span>
          ) : justSaved ? (
            <span className="saved-text">
              <span aria-hidden="true">✔</span> All changes saved locally.
            </span>
          ) : (
            <span className="saved-text">Changes are saved automatically.</span>
          )}
        </div>
      </form>
    </ProtectedSection>
  );
};

export default CustomApiPanel;
