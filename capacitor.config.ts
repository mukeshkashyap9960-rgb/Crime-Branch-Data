import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gujaratpolice.crimebranch',
  appName: 'Gujarat Police Crime Branch',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
