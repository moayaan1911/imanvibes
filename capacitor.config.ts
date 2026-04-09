/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moayaan.imanvibes',
  appName: 'ImanVibes',
  webDir: 'out',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_imanvibes',
      iconColor: '#6f8f7b',
    },
  },
};

export default config;
