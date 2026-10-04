import type { PilotColors } from './color-tokens';

export type PilotAsset =
  | Readonly<{ kind: 'image' | 'icon'; src: string }>
  | Readonly<{ kind: 'animation'; src: string; reducedMotionSrc: string }>
  | Readonly<{ kind: 'video'; src: string; poster?: string }>;

export interface PilotTheme {
  readonly id: string;
  readonly colorScheme: 'light' | 'dark';
  readonly colors: PilotColors;
  readonly assets: Readonly<Record<string, PilotAsset>>;
}

export interface PilotThemeOptions {
  readonly themes: readonly PilotTheme[];
  readonly initialTheme: string;
}
