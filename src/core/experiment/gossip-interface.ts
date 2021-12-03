import { Observable } from 'rxjs';
import { Peers } from '../core/peers';

export class GossipSocketInterface {
  constructor(private readonly peers: Peers) {}



  broadcast(message: Buffer): void {

  }

  listen(): Observable<Buffer> {

  }
}
