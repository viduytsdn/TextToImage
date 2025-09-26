import { ReactNode, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type ProtectedSectionProps = {
  title: string;
  description: string;
  storageKey: string;
  children: ReactNode;
};

const UNLOCK_TOKEN = 'unlock';

const ProtectedSection = ({ title, description, storageKey, children }: ProtectedSectionProps) => {
  const [isUnlocked, setUnlocked] = useLocalStorage<boolean>(`${storageKey}-unlocked`, false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  useEffect(() => {
    if (!isUnlocked) {
      setConfirmationText('');
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (showSavedBanner) {
      const timeout = window.setTimeout(() => setShowSavedBanner(false), 2500);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [showSavedBanner]);

  return (
    <div className="protected-shell">
      <header className="protected-header">
        <h2>{title}</h2>
        {isUnlocked ? (
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setUnlocked(false);
              setShowSavedBanner(false);
            }}
          >
            Lock
          </button>
        ) : null}
      </header>
      {!isUnlocked ? (
        <div className="protected-locked" aria-live="polite">
          <p>{description}</p>
          <label className="field">
            <span>Type “{UNLOCK_TOKEN.toUpperCase()}” to unlock</span>
            <input
              type="text"
              autoComplete="off"
              value={confirmationText}
              onChange={(event) => setConfirmationText(event.target.value.toLowerCase())}
              placeholder={UNLOCK_TOKEN.toUpperCase()}
            />
          </label>
          <button
            type="button"
            className="primary-button"
            disabled={confirmationText !== UNLOCK_TOKEN}
            onClick={() => {
              setUnlocked(true);
              setShowSavedBanner(true);
            }}
          >
            Unlock settings
          </button>
        </div>
      ) : (
        <div className="protected-content">
          {showSavedBanner ? (
            <div className="saved-banner" role="status">
              Sensitive controls unlocked. Remember to lock when you are done.
            </div>
          ) : null}
          {children}
        </div>
      )}
    </div>
  );
};

export default ProtectedSection;
