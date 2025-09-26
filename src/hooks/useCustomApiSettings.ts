import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

type AuthPlacement = 'header' | 'query';

export interface UsageOptions {
  sendPrompt: boolean;
  sendMetadata: boolean;
  allowImageUpscale: boolean;
}

export interface CustomApiSettings {
  endpointUrl: string;
  authPlacement: AuthPlacement;
  authKey: string;
  authValue: string;
  useCustomApi: boolean;
  usageOptions: UsageOptions;
}

const DEFAULT_SETTINGS: CustomApiSettings = {
  endpointUrl: '',
  authPlacement: 'header',
  authKey: '',
  authValue: '',
  useCustomApi: false,
  usageOptions: {
    sendPrompt: true,
    sendMetadata: false,
    allowImageUpscale: true
  }
};

export const useCustomApiSettings = () => {
  const [settings, setSettings] = useLocalStorage<CustomApiSettings>('custom-api-settings', DEFAULT_SETTINGS);

  const updateSettings = useCallback(
    (patch: Partial<Omit<CustomApiSettings, 'usageOptions'>>) => {
      setSettings((prev) => ({
        ...prev,
        ...patch
      }));
    },
    [setSettings]
  );

  const updateUsageOptions = useCallback(
    (usageOptions: UsageOptions) => {
      setSettings((prev) => ({
        ...prev,
        usageOptions
      }));
    },
    [setSettings]
  );

  const toggleGlobalUsage = useCallback(
    (nextValue: boolean) => {
      setSettings((prev) => ({
        ...prev,
        useCustomApi: nextValue
      }));
    },
    [setSettings]
  );

  return {
    settings,
    updateSettings,
    updateUsageOptions,
    toggleGlobalUsage
  };
};
