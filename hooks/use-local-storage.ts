"use client"
import { useCallback, useSyncExternalStore } from "react";

export const notifyStorageChange = (key: string) => {
  const event = new CustomEvent('local-storage-update', { detail: { key } });
  window.dispatchEvent(event);
};

export default function useLocalStorage<T>(
  key: string,
  { initialValue,
    parse = (value) => JSON.parse(value),
    stringify = (value) => JSON.stringify(value),
  } : {
    initialValue: T,
    parse?: (value: string) => T,
    stringify?: (value: T) => string,
  }) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback);
    window.addEventListener('local-storage-update', callback);
    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('local-storage-update', callback);
    };
  }, []);

  const getSnapshot = () => {
    const item = window.localStorage.getItem(key);
    return item ? item : stringify(initialValue);
  };
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const data = parse(store) as T;

  const setState = (newValue: T | ((prev: T) => T)) => {
    const valueToStore = newValue instanceof Function ? newValue(data) : newValue;
    window.localStorage.setItem(key, stringify(valueToStore));
    notifyStorageChange(key);
  };

  const remove = () => {
    window.localStorage.removeItem(key);
    notifyStorageChange(key);
  };

  return [data, setState, remove] as const;
}