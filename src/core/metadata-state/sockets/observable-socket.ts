import { Observable } from "rxjs";

export interface ObservableSocket {
  readonly onClose$: Observable<{ reason: string, description?: Error | undefined }>;
  readonly messages$: Observable<Buffer>;
  readonly isClosed: boolean;
  readonly host: string;

  sendMessage(message: Buffer): Promise<void>;

  waitUntilOpen(): Promise<void>;
}
