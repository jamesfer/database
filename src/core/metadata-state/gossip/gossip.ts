import { sample, sortedIndexBy } from 'lodash';
import { EMPTY, Observable, of } from 'rxjs';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Config } from '../../../types/config';
import { StateChange } from '../types/state-change';
import { createBloomFilter } from '../utils/bloom';

function produceGossipRequests(
  peers$: Observable<string[]>,
  trigger$: Observable<unknown>,
  currentState$: Observable<[Config, StateChange[]]>,
): Observable<GossipStateRequest> {
  return trigger$.pipe(
    withLatestFrom(peers$, currentState$),
    mergeMap(([_, peers, [_, changes]]) => {
      // Pick a random peer
      const peer = sample(peers);
      if (!peer) {
        return EMPTY;
      }

      return of(new GossipStateRequest(createBloomFilter(changes.map(change => change.hash))));
    }),
  );
}

function respondToGossipRequests(
  incomingRequests$: Observable<GossipStateRequest>,
): Observable<GossipStateResponse> {

}

function processGossipResponses(
  inputMessages$: Observable<GossipStateResponse>,
  currentState$: Observable<[Config, StateChange[]]>,
): Observable<[Config, StateChange[]]> {
  return inputMessages$.pipe(
    withLatestFrom(currentState$),
    map(([response, [state, currentChanges]]) => [state, response.missingUpdates.reduce(
      (changes, update) => {
        const insertionIndex = sortedIndexBy(
          changes,
          update,
          stateChange => `${stateChange.timestamp}-${stateChange.hash}`,
        );
        if (changes[insertionIndex].hash === update.hash) {
          // Skip the update
          return changes;
        }
        return [...changes].splice(insertionIndex, 0, update);
      },
      currentChanges,
    )]),
  )
}

function decodeIncomingMessage(message: string | Buffer): GossipStateRequest | GossipStateResponse | undefined {
  const string = typeof message === 'string' ? message : message.toString();
  try {
    const payload = JSON.parse(string);

  } catch {
    return undefined;
  }
}

export function runGossip(
  peers$: Observable<string>,
  outgoingTrigger$: Observable<void>,
  incomingMessages$: Observable<string | Buffer>,
  currentState$: Observable<[Config, StateChange[]]>,
): { newStateChanges$: Observable<StateChange[]>, outgoingMessages$: Observable<string> } {

}
