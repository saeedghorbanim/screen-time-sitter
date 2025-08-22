import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ab8157ed796441b7a872fdc0bc1faec7',
  appName: 'screen-time-sitter',
  webDir: 'dist',
  server: {
    url: 'https://ab8157ed-7964-41b7-a872-fdc0bc1faec7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;