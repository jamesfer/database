import engine, { Socket } from 'engine.io';
import client from 'engine.io-client';
import { omit, uniqueId } from 'lodash';
import {
  BehaviorSubject,
  concat,
  ConnectableObservable,
  from,
  fromEvent,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  map,
  mergeMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Resource } from '../../../utils/resource';
import { ObservableClientSocket } from './observable-client-socket';
import { ObservableServerSocket } from './observable-server-socket';
import { ObservableSocket } from './observable-socket';

export class SocketServer {
  private readonly server = engine.listen(this.port);

  private readonly incomingConnections$: Observable<ObservableServerSocket> = (
    fromEvent<Socket>(this.server, 'connection')
      .pipe(map(socket => new ObservableServerSocket(socket)))
  );

  private readonly outgoingConnections$: Subject<ObservableClientSocket> = new Subject<ObservableClientSocket>();

  // An observable that collects all the open sockets in a single map. Sockets are removed from the
  // map when they are closed.
  private readonly openSocketsMap$: Observable<{ [k: string]: ObservableSocket }> =
    this.incomingConnections$.pipe(
      obs => withLatestFrom<ObservableSocket, Observable<{ [k: string]: ObservableSocket }>>(this.openSocketsMap$)(obs),
      // TODO detect existing open sockets
      mergeMap(([socket, collection]) => concat(
        // Add the socket to the collection
        of({ ...collection, [socket.host]: socket }),
        // When the socket closes, remove it from the collection
        socket.onClose$.pipe(
          withLatestFrom(this.openSocketsMap$),
          map(([_, collection]) => omit(collection, socket.host)),
        ),
      )),
    );

  private readonly openSocketsMapBehaviour$: BehaviorSubject<{[p: string]: ObservableSocket}> = new BehaviorSubject<{[p: string]: ObservableSocket}>({});

  private readonly openSocketsMapSubscription = this.openSocketsMap$.subscribe(this.openSocketsMapBehaviour$);

  readonly openSockets$: Observable<ObservableSocket[]> = this.openSocketsMap$.pipe(map(Object.values))

  private constructor(public readonly port: number) {}

  static create(port: number): Resource<SocketServer> {
    return new Resource(() => {
      const server = new SocketServer(port);
      return [server, () => server.close()];
    });
  }

  openSocket(host: string): ObservableClientSocket {
    const newSocket = new ObservableClientSocket(host, client(host));
    this.outgoingConnections$.next(newSocket);
    return newSocket;
  }

  getSocket(host: string): ObservableSocket | undefined {
    const openSockets = this.openSocketsMapBehaviour$.getValue();
    return host in openSockets ? openSockets[host] : undefined;
  }

  private close(): void {
    this.server.close();
    this.openSocketsMapSubscription.unsubscribe();
    this.openSocketsMapBehaviour$.complete();
    this.outgoingConnections$.complete();
  }
}
