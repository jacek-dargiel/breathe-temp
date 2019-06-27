interface DeviceOptions {
  address: string;
  token?: string;
}

interface Temperature {
  value: number;
  unit: string;
}

declare class Device {
  on: (eventName: string, handler: Function) => void;
  off: (eventName: string, handler: Function) => void;
  pm2_5: () => Promise<number>;
  destroy: () => void;
  mode: () => Promise<MiAirPurifierMode>;
  modes: () => MiAirPurifierMode[];
  setMode: (mode: MiAirPurifierMode) => Promise<MiAirPurifierMode>;
  favoriteLevel: () => Promise<number>;
  setFavoriteLevel: (mode: number) => Promise<number>;
  temperature: () => Promise<{value: number, unit: string}>;
}

type MiAirPurifierMode = 'idle' | 'auto' | 'silent' | 'favorite';

declare module 'miio' {
  export function device(config: DeviceOptions): Promise<Device>;
}
