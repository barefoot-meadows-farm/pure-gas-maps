import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.puregas.maps',
  appName: 'Pure Gas',
  webDir: 'dist',

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0f172a',
    },
  },

  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    minVersion: '14.0',
  },

  android: {
    backgroundColor: '#0f172a',
    minWebViewVersion: 80,
  },
}

export default config
