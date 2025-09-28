import { Buffer } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
  
  if (!window.global) {
    (window as any).global = window;
  }
  
  if (!window.crypto) {
    (window as any).crypto = {
      getRandomValues: function(arr: any) {
        return crypto.getRandomValues(arr);
      },
      randomBytes: function(size: number) {
        const array = new Uint8Array(size);
        crypto.getRandomValues(array);
        return array;
      }
    };
  }
}

export { Buffer, process };