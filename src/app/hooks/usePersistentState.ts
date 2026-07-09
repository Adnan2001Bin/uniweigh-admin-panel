import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function usePersistentState<T>(
  storageKey: string,
  initializer: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initializer);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
