import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Codec } from '../../../avro';
import { SocketMessageServer } from './socket-message-server';

export class AvroSocketMessageServer<T> {
  readonly incomingMessages$: Observable<T> = this.socketMessageServer.incomingMessages$.pipe(
    map(message => this.messageCodec.deserialize(message)),
    filter(message => message != null) as (o: Observable<T | undefined>) => Observable<T>,
  );

  constructor(
    private readonly socketMessageServer: SocketMessageServer,
    private readonly messageCodec: Codec<T>,
  ) {}

  async sendMessage(to: string, message: T): Promise<void> {
    return this.socketMessageServer.sendMessage(to, this.messageCodec.serialize(message));
  }
}
