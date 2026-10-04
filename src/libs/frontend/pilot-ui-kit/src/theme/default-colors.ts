import type { PilotColors } from './color-tokens';

// The only base palette. Consumers use semantic tokens, never these literal values.
export const DEFAULT_PILOT_COLORS: PilotColors = Object.freeze({
  primary: '#254e7b', onPrimary: '#ffffff', primaryContainer: '#d5e4fa', onPrimaryContainer: '#0d2948',
  secondary: '#545f70', onSecondary: '#ffffff', secondaryContainer: '#d8e3f6', onSecondaryContainer: '#172333',
  tertiary: '#685477', onTertiary: '#ffffff', tertiaryContainer: '#eedbfc', onTertiaryContainer: '#251332',
  background: '#f8f9fc', onBackground: '#1a1c20',
  surface: '#ffffff', surfaceVariant: '#e1e5ed', onSurface: '#1a1c20', onSurfaceVariant: '#424751',
  outline: '#707784', outlineVariant: '#c2c7d1',
  error: '#ba1a1a', onError: '#ffffff', errorContainer: '#ffdad6', onErrorContainer: '#410002',
  inverseSurface: '#2e3035', inverseOnSurface: '#f0f0f5', inversePrimary: '#a8c8f2',
  shadow: '#000000', scrim: '#000000',
});
