import { Socket as ServerSocket } from 'engine.io';
import { defer, EMPTY, fromEvent, fromEventPattern, Observable } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { ObservableSocket } from './observable-socket';

export class ObservableServerSocket implements ObservableSocket {
  readonly onClose$: Observable<{ reason: string, description?: Error | undefined }> = defer(
    () => {
      if (this.isClosed) {
        return EMPTY;
      }

      return fromEventPattern<{ reason: string, description?: Error | undefined }>(
        innerHandler => {
          const callback = (reason: string, description?: Error) => innerHandler({ reason, description });
          this.socket.addListener('close', callback);
          return callback;
        },
        callback => {
          this.socket.removeListener('close', callback);
        },
      ).pipe(take(1));
    },
  );

  readonly messages$: Observable<Buffer> = defer(
    () => {
      if (this.isClosed) {
        return EMPTY;
      }

      return fromEvent<string | Buffer>(this.socket, 'message').pipe(
        takeUntil(this.onClose$),
        map(stringOrBuffer => typeof stringOrBuffer === 'string' ? Buffer.from(stringOrBuffer) : stringOrBuffer),
      );
    },
  );

  constructor(private readonly socket: ServerSocket) {}

  get isClosed(): boolean {
    return this.socket.readyState === 'closing' || this.socket.readyState === 'closed';
  }

  get host(): string {
    return this.socket.request.headers.host ?? '';
  }

  sendMessage(message: string | Buffer): Promise<void> {
    return new Promise(async (resolve) => {
      await this.waitUntilOpen();
      this.socket.send(message, { compress: true }, resolve);
    });
  }

  waitUntilOpen(): Promise<void> {
    if (this.isClosed) {
      return Promise.reject(new Error('A closed socket will never open'));
    }

    return Promise.resolve();
  }
}
