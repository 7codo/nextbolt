export const getPersistedStore = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  const stored = window.__NEXT__HOT_DATA__?.[key] as T;
  return stored ?? defaultValue;
};
