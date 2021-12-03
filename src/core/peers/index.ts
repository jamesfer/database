import { Observable, of } from 'rxjs';

export class Peers {
  readonly peers$: Observable<string[]> =
    of(process.env.PEER_NODES ? process.env.PEER_NODES.split(',') : []);
}
