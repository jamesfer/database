import { differenceBy, sortBy, takeRightWhile } from 'lodash';
import { defer, interval, MonoTypeOperatorFunction, NEVER, Observable, of, Subject } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  ignoreElements,
  map,
  mergeMap,
  multicast,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Resource } from '../../utils/resource';
import { AvroSocketMessageServer } from '../metadata-state/sockets/avro-socket-message-server';
import { delayBy } from '../metadata-state/utils/delay-by';
import { recursive } from '../metadata-state/utils/recursive';
import { selfMergeInParallel } from '../metadata-state/utils/self-merge-in-parallel';
import { Peers } from '../peers';
import { KeyedUpdate } from './types/keyed-update';
import { StateChangeMessage } from './types/state-change-message';

export class GossipBasedState<T> {
  private readonly localUpdates$ = new Subject<KeyedUpdate<T>>();

  private readonly currentState$: Observable<{ [k: string]: T }> = of<[{ [k: string]: T }, KeyedUpdate<T>[]]>([{}, []]).pipe(
    recursive(internalState$ => internalState$.pipe(
      selfMergeInParallel(
        // Flatten old changes to the state
        this.flattenOldestChanges(30000),
        // Broadcast the current state
        this.broadcastUpdates(2000, this.peers.peers$),
        // Incorporate external changes into the mix
        this.incorporateExternalUpdates(this.messageServer.incomingMessages$),
        // Add local changes to the list
        this.incorporateLocalUpdates(this.localUpdates$),
      ),
    )),
    map(([state, updates]) => this.applyAllStateChanges(state, updates)),
  );

  private readonly multicastedCurrentState$ = multicast<{ [k: string]: T }>(new Subject())(this.currentState$);

  private constructor(
    private readonly id: string,
    private readonly peers: Peers,
    private readonly messageServer: AvroSocketMessageServer<StateChangeMessage<T>>,
  ) {}

  static create<T>(
    id: string,
    peers: Peers,
    messageServer: AvroSocketMessageServer<StateChangeMessage<T>>,
  ): Resource<GossipBasedState<T>> {
    return new Resource(() => {
      const state = new GossipBasedState(id, peers, messageServer);
      const subscription = state.multicastedCurrentState$.connect();
      return [state, () => subscription.unsubscribe()]
    });
  }

  get state(): Observable<{ [k: string]: T }> {
    return this.multicastedCurrentState$;
  }

  pushUpdate(path: string, state: T | undefined): void {
    this.localUpdates$.next({
      path,
      state,
      id: Buffer.from(Math.random().toString().slice(2)).toString('base64'),
      timestamp: Date.now(),
    });
  }

  private incorporateLocalUpdates(localUpdates$: Observable<KeyedUpdate<T>>) {
    return (currentState$: Observable<[{ [k: string]: T }, KeyedUpdate<T>[]]>): Observable<[{ [k: string]: T }, KeyedUpdate<T>[]]> => (
      localUpdates$.pipe(
        withLatestFrom(currentState$),
        map(([newLocalChange, [currentState, currentChangeList]]) => {
          const sortedNewChanges = sortBy([...currentChangeList, newLocalChange], change => change.timestamp);
          return [currentState, sortedNewChanges];
        }),
      )
    );
  }

  private incorporateExternalUpdates(incomingMessages$: Observable<StateChangeMessage<T>>) {
    return (currentState$: Observable<[{ [k: string]: T }, KeyedUpdate<T>[]]>): Observable<[{ [k: string]: T }, KeyedUpdate<T>[]]> => (
      incomingMessages$.pipe(
        withLatestFrom(currentState$),
        map(([{ changes: externalChanges }, [state, currentChanges]]) => {
          // Merge new changes into current state
          const newChanges = differenceBy(externalChanges, currentChanges, change => change.id);
          const sortedNewChanges = sortBy([...currentChanges, ...newChanges], change => change.timestamp);
          return [state, sortedNewChanges];
          // const insertionIndices = newChanges.map(newChange => sortedIndexBy(currentChanges, newChange, change => change.timestamp));
          // return newChanges.reduce(
          //   (allChanges, newChange) => {
          //
          //   },
          //   currentChanges,
          // )
        }),
      )
    );
  }

  private broadcastUpdates(triggerInterval: number, peers$: Observable<string[]>) {
    return (currentState$: Observable<[{ [k: string]: T }, KeyedUpdate<T>[]]>): Observable<never> => (
      interval(triggerInterval).pipe(
        withLatestFrom(peers$, currentState$),
        mergeMap(([_1, peers, [_2, changes]]) => {
          // Send all state changes to all peers
          const broadcastingMessage = Promise.all(peers.map((peer) => {
            return this.messageServer.sendMessage(peer, { changes });
          }));
          return fromPromise(broadcastingMessage).pipe(ignoreElements());
        }),
      )
    );
  }

  private flattenOldestChanges(bufferTime: number): MonoTypeOperatorFunction<[{ [k: string]: T }, KeyedUpdate<T>[]]> {
    return switchMap(([state, changes]) => {
      if (changes.length === 0) {
        return NEVER;
      }

      // Remove the oldest changes when they cross the buffer threshold.
      const timeRemaining = changes[0].timestamp - (Date.now() - bufferTime);
      return delayBy<[{ [k: string]: T }, KeyedUpdate<T>[]]>(
        timeRemaining,
        defer(() => of(this.flattenOldChanges(bufferTime, state, changes)))
      );
    });
  }

  private flattenOldChanges(
    bufferTime: number,
    state: { [k: string]: T },
    changes: KeyedUpdate<T>[],
  ): [{ [k: string]: T }, KeyedUpdate<T>[]] {
    const now = Date.now();
    const oldestTimestamp = now - bufferTime;
    const changesToFlatten = takeRightWhile(changes, change => change.timestamp <= oldestTimestamp);
    const changesToKeep = changes.slice(0, -changesToFlatten.length);
    return [this.applyAllStateChanges(state, changesToFlatten), changesToKeep];
  }

  private applyAllStateChanges(state: { [k: string]: T }, changes: KeyedUpdate<T>[]): { [k: string]: T } {
    return changes.reduce(
      (updatedConfig, change) => {
        if (change.state === undefined) {
          delete updatedConfig[change.path];
        } else {
          updatedConfig[change.path] = change.state;
        }
        return updatedConfig;
      },
      { ...state },
    )
  }
}
