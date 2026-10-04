export const PILOT_COLOR_VARIABLE = Object.freeze({
  primary: '--pilot-color-primary',
  onPrimary: '--pilot-color-on-primary',
  primaryContainer: '--pilot-color-primary-container',
  onPrimaryContainer: '--pilot-color-on-primary-container',
  secondary: '--pilot-color-secondary',
  onSecondary: '--pilot-color-on-secondary',
  secondaryContainer: '--pilot-color-secondary-container',
  onSecondaryContainer: '--pilot-color-on-secondary-container',
  tertiary: '--pilot-color-tertiary',
  onTertiary: '--pilot-color-on-tertiary',
  tertiaryContainer: '--pilot-color-tertiary-container',
  onTertiaryContainer: '--pilot-color-on-tertiary-container',
  background: '--pilot-color-background',
  onBackground: '--pilot-color-on-background',
  surface: '--pilot-color-surface',
  surfaceVariant: '--pilot-color-surface-variant',
  onSurface: '--pilot-color-on-surface',
  onSurfaceVariant: '--pilot-color-on-surface-variant',
  outline: '--pilot-color-outline',
  outlineVariant: '--pilot-color-outline-variant',
  error: '--pilot-color-error',
  onError: '--pilot-color-on-error',
  errorContainer: '--pilot-color-error-container',
  onErrorContainer: '--pilot-color-on-error-container',
  inverseSurface: '--pilot-color-inverse-surface',
  inverseOnSurface: '--pilot-color-inverse-on-surface',
  inversePrimary: '--pilot-color-inverse-primary',
  shadow: '--pilot-color-shadow',
  scrim: '--pilot-color-scrim',
} as const);

export type PilotColorRole = keyof typeof PILOT_COLOR_VARIABLE;
export type PilotColors = Readonly<Record<PilotColorRole, string>>;

export const PILOT_COLOR = Object.freeze(Object.fromEntries(
  Object.entries(PILOT_COLOR_VARIABLE).map(([role, variable]) => [role, `var(${variable})`]),
)) as Readonly<Record<PilotColorRole, string>>;
