import { last, omit, takeRightWhile } from 'lodash';
import {
  defer,
  MonoTypeOperatorFunction,
  NEVER,
  Observable,
  of,
  Subject,
  timer
} from 'rxjs';
import { expand, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Config } from '../../types/config';
import { assertNever } from '../../utils/assert-never';
import { runGossip, processGossipResponses } from './gossip/gossip';
import { StateChange, StateDelete, StatePut } from './types/state-change';
import { delayBy } from './utils/delay-by';
import { flattenId } from './utils/flatten-id';
import { mergeInParallel } from './utils/merge-in-parallel';
import { recursive } from './utils/recursive';

function applyStateChange(state: Config, change: StateChange): Config {
  if (change instanceof StatePut) {
    return new Config({
      ...state.entries,
      [flattenId(change.id)]: change.configEntry,
    });
  } else if (change instanceof StateDelete) {
    return new Config(omit(state.entries, flattenId(change.id)));
  } else {
    return assertNever(change);
  }
}

function applyAllStateChanges(state: Config, changes: StateChange[]): Config {
  return changes.reduce(applyStateChange, state);
}

function filterOldChanges(
  bufferTime: number,
  config: Config,
  changes: StateChange[],
): [Config, StateChange[]] {
  const now = Date.now();
  const oldestTimestamp = now - bufferTime;
  const changesToFlatten = takeRightWhile(changes, change => change.timestamp <= oldestTimestamp);
  const changesToKeep = changes.slice(0, -changesToFlatten.length);
  return [applyAllStateChanges(config, changesToFlatten), changesToKeep];
}

function recursivelyFilterOldChanges(bufferTime: number): MonoTypeOperatorFunction<[Config, StateChange[]]> {
  return expand(([config, changes]) => {
    const lastChange = last(changes);
    if (!lastChange) {
      return NEVER;
    }

    const timeRemaining = lastChange.timestamp - (Date.now() - bufferTime);
    return delayBy<[Config, StateChange[]]>(timeRemaining, defer(() => of(filterOldChanges(bufferTime, config, changes))));
  });
}

function bufferRecentChanges(bufferTime: number): MonoTypeOperatorFunction<[Config, StateChange[]]> {
  // TODO don't recursively filter old changes, just do it once, then when the message comes
  //  back through the pipeline, it will be filtered again
  return switchMap(value => of(value).pipe(recursivelyFilterOldChanges(bufferTime)));
}

const appendLocalChanges = (localAdditions$: Observable<StateChange>) => (
  state$: Observable<[Config, StateChange[]]>,
): Observable<[Config, StateChange[]]> => {
  return localAdditions$.pipe(
    withLatestFrom(state$),
    map(([newChange, [config, currentChanges]]) => [config, [...currentChanges, newChange]]),
  );
}

function validate(
  state$: Observable<[Config, StateChange[]]>,
): Observable<[Config, StateChange[]]> {

}

export function manageState(
  inputMessages$: Observable<string>,
): Observable<[(input: StateChange) => void, Observable<Config>]> {
  return new Observable<[(input: StateChange) => void, Observable<Config>]>((subscriber) => {
    const localInputs$ = new Subject<StateChange>();

    const intermediateState$ = of<[Config, StateChange[]]>([new Config({}), []]).pipe(
      recursive(internalState$ => (
        internalState$.pipe(
          bufferRecentChanges(5 * 60 * 1000),
          // TODO put validation inside these two implementations
          mergeInParallel(
            processGossipResponses(inputMessages$),
            appendLocalChanges(localInputs$),
          ),
        )
      )),
    );

    const mainSubscription = of<[(input: StateChange) => void, Observable<Config>]>([
      input => localInputs$.next(input),
      intermediateState$.pipe(map(([state, changes]) => applyAllStateChanges(state, changes))),
    ]).subscribe(subscriber);

    return () => {
      mainSubscription.unsubscribe();
      localInputs$.unsubscribe();
    };
  });
}

export function manageGossip(intermediateState$: Observable<[Config, StateChange[]]>): Observable<string> {
  const peers$: Observable<string[]> = 1;
  const triggerGossip$: Observable<unknown> = timer(3000, 3000);
  const outgoingMessages$: Observable<string> = runGossip(peers$, triggerGossip$, intermediateState$);
  return outgoingMessages$;
}

