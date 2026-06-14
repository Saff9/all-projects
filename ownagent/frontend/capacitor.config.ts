import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.genzsmart.app',
  appName: 'Apex Smart',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true  // For local development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e'
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK'
    }
  }
};

export default config;
