import { Observable, timer } from 'rxjs';
import { Config, ConfigEntry } from '../../types/config';
import { Resource } from '../../utils/resource';
import { runGossip } from './gossip/gossip';
import { SocketMessageServer } from './sockets/socket-message-server';
import { StateChange } from './types/state-change';

/**
 * Publishes changes to the config state and consumes updates from gossip.
 */
export class MetadataState {
  private readonly triggerGossip$: Observable<unknown> = timer(3000, 3000);

  private readonly intermediateState$: Observable<[Config, StateChange[]]>;

  private constructor(
    private readonly peers$: Observable<string[]>,
    private readonly socketMessageServer: SocketMessageServer,
  ) {}

  static create(socketPort: number, peers$: Observable<string[]>): Resource<MetadataState> {
    SocketMessageServer.create(socketPort)
      .flatMap<MetadataState>(messageServer => new Resource<MetadataState>(() => {
        const state = new MetadataState(peers$, messageServer);
        return [state, () => {}];
      }))
  }

  publish(event: ConfigEntry) {
  }
  
  get config$(): Observable<Config> {
  }

  private manageGossip(): Observable<string> {
    return runGossip(this.peers$, this.triggerGossip$, this.intermediateState$);
  }
}
