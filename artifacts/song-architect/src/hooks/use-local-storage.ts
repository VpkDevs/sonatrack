import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const resolveInitial = () =>
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;

    if (typeof window === "undefined") {
      return resolveInitial();
    }
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : resolveInitial();
    } catch (error) {
      console.error(error);
      return resolveInitial();
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore =
          typeof value === "function"
            ? (value as (val: T) => T)(prev)
            : value;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          console.error(error);
        }
        return valueToStore;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
