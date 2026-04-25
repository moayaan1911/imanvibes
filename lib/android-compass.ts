import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

export type AndroidCompassHeadingEvent = {
  heading: number;
  accuracy?: number;
  source?: string;
};

export type AndroidCompassPlugin = {
  start(): Promise<void>;
  stop(): Promise<void>;
  addListener(
    eventName: "heading",
    listenerFunc: (event: AndroidCompassHeadingEvent) => void,
  ): Promise<PluginListenerHandle>;
};

const AndroidCompass = registerPlugin<AndroidCompassPlugin>("AndroidCompass");

export default AndroidCompass;
