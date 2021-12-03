import { from, Observable } from 'rxjs';
import { mergeAll, switchMap } from 'rxjs/operators';
import { Resource } from '../../../utils/resource';
import { SocketServer } from './socket-server';

export class SocketMessageServer {
  readonly incomingMessages$: Observable<Buffer> = this.socketServer.openSockets$.pipe(
    // Use from and mergeAll instead of the merge constructor so that we don't have to spread the
    // socket array into the parameters of merge
    switchMap(sockets => from(sockets.map(socket => socket.messages$)).pipe(mergeAll())),
  )

  private constructor(private readonly socketServer: SocketServer) {}

  static create(socketPort: number): Resource<SocketMessageServer> {
    return SocketServer.create(socketPort)
      .flatMap(server => new Resource<SocketMessageServer>(() => {
        const messageServer = new SocketMessageServer(server);
        return [messageServer, () => {}];
      }));
  }

  async sendMessage(to: string, message: Buffer): Promise<void> {
    const socket = this.socketServer.getSocket(to) ?? this.socketServer.openSocket(to);
    await socket.sendMessage(message);
  }
}
