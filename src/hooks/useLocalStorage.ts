import { useCallback, useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

const readValue = <T,>(key: string, initialValue: T): T => {
  if (!isBrowser) {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.warn(`Unable to read localStorage key "${key}":`, error);
    return initialValue;
  }
};

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => readValue(key, initialValue));

  useEffect(() => {
    setStoredValue(readValue(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (!isBrowser) {
        return;
      }

      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Unable to write localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readValue(key, initialValue));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [initialValue, key]);

  return [storedValue, setValue] as const;
};
