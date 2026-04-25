import { registerPlugin } from "@capacitor/core";

export type AndroidSystemPlugin = {
  openAppSettings(): Promise<void>;
  openNotificationSettings(): Promise<void>;
  openLocationSettings(): Promise<void>;
  openPlayStorePage(): Promise<void>;
};

const AndroidSystem = registerPlugin<AndroidSystemPlugin>("AndroidSystem");

export default AndroidSystem;
