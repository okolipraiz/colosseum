import { useCallback } from "react";

type StorageType = "session" | "local";
type UseStorageReturnValue = {
  getItem: (key: string, type?: StorageType) => string;
  setItem: (key: string, value: string, type?: StorageType) => boolean;
  removeItem: (key: string, type?: StorageType) => void;
};

const useStorage = (): UseStorageReturnValue => {
  const storageType = useCallback(
    (type?: StorageType): "localStorage" | "sessionStorage" =>
      `${type ?? "local"}Storage`,
    [],
  );

  const isBrowser: boolean = ((): boolean => typeof window !== "undefined")();

  const getItem = useCallback(
    (key: string, type?: StorageType): string => {
      return isBrowser ? window[storageType(type)][key] ?? null : "";
    },
    [isBrowser, storageType],
  );

  const setItem = useCallback(
    (key: string, value: string, type?: StorageType): boolean => {
      if (isBrowser) {
        window[storageType(type)].setItem(key, value);
        return true;
      }

      return false;
    },
    [isBrowser, storageType],
  );

  const removeItem = useCallback(
    (key: string, type?: StorageType): void => {
      if (!isBrowser) return;

      window[storageType(type)].removeItem(key);
    },
    [isBrowser, storageType],
  );

  return {
    getItem,
    setItem,
    removeItem,
  };
};

export default useStorage;
