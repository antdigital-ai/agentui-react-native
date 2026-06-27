import { Platform, StyleSheet } from 'react-native';

export const demoColors = {
  screen: '#ffffff',
  toolbarBorder: '#f0f0f0',
};

export const demoStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: demoColors.screen,
    ...(Platform.OS === 'web' ? { minHeight: 0, height: '100%' as const } : null),
  },
  appShell: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? { maxWidth: 375, alignSelf: 'center' as const, minHeight: 0 }
      : null),
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: demoColors.toolbarBorder,
  },
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  footerHint: {
    padding: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
});
