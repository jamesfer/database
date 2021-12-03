import * as engineIOClient from 'engine.io-client';

declare module 'engine.io-client' {
  interface Socket {
    readonly readyState: '' | 'opening' | 'open' | 'closing' | 'closed';

    addListener(event: string, fn: (...args: any[]) => void): void;
    addEventListener(event: string, fn: (...args: any[]) => void): void;
    off(event: string, fn: (...args: any[]) => void): void;
    removeListener(event: string, fn: (...args: any[]) => void): void;
    removeEventListener(event: string, fn: (...args: any[]) => void): void;
  }
}

export = engineIOClient;
