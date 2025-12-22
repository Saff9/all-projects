import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.televault.drive',
  appName: 'TeleVault',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0e17',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a0e17',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#0a0e17',
      style: 'DARK',
    },
  },
};

export default config;
