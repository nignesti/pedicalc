import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nignesti.pedicalc',
  appName: 'PediCalc',
  webDir: 'dist',
  android: {
    backgroundColor: '#f8fafc',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
