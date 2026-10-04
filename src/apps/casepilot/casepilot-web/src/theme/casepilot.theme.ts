import { DEFAULT_PILOT_COLORS, type PilotTheme } from '@casepilot/pilot-ui-kit';
import { APP_ASSET } from './asset-names';

export const CASEPILOT_THEMES: readonly PilotTheme[] = [
  {
    id: 'default',
    colorScheme: 'light',
    colors: DEFAULT_PILOT_COLORS,
    assets: {
      [APP_ASSET.brandLogo]: { kind: 'image', src: 'themes/default/logo.svg' },
      [APP_ASSET.emptyState]: { kind: 'icon', src: 'themes/default/empty.svg' },
    },
  },
  {
    id: 'christmas',
    colorScheme: 'light',
    colors: { ...DEFAULT_PILOT_COLORS, primary: '#236342', onPrimary: '#ffffff', secondary: '#8c3434' },
    assets: {
      [APP_ASSET.brandLogo]: { kind: 'image', src: 'themes/christmas/logo.svg' },
    },
  },
];
