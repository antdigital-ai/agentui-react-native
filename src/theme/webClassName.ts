import { Platform } from 'react-native';

type WebClassProps = { className?: string };

/** React Native Web `className` (not in core RN ViewProps). */
export function webClassName(name: string): WebClassProps {
  if (Platform.OS !== 'web') {
    return {};
  }
  return { className: name };
}
