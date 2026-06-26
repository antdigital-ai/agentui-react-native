import { useRef } from 'react';

export const useShallowMemo = <T,>(value: T): T => {
  const ref = useRef<T>(value);
  if (ref.current !== value) {
    ref.current = value;
  }
  return ref.current;
};
