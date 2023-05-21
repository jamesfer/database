import { ConfigFolder, ConfigFolderItem, FullyQualifiedPath } from '../config';
import { Observable, Subject } from 'rxjs';
import { concatMap, ignoreElements, mergeMap, pairwise, startWith } from 'rxjs/operators';
import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { ConfigLifecycle, } from '../../../facades/distributed-operator-facade';
import { AllComponentConfigurations } from '../../../components/scaffolding/all-component-configurations';
import { assert } from '../../../utils/assert';
import { getFacade } from '../../../components/scaffolding/component-utils';

interface ConfigCreate {
  type: 'create';
  path: FullyQualifiedPath;
  entry: AllComponentConfigurations;
}

interface ConfigUpdate {
  type: 'update';
  path: FullyQualifiedPath;
  entry: AllComponentConfigurations;
}

interface ConfigDelete {
  type: 'delete';
  path: FullyQualifiedPath;
}

type ConfigChange = ConfigCreate | ConfigUpdate | ConfigDelete;

function entryItemsAreEqual(
  previousEntry: ConfigFolderItem,
  nextEntry: ConfigFolderItem,
): boolean {
  if (nextEntry.item.NAME !== previousEntry.item.NAME) {
    return false;
  }

  const equalsFacade = getFacade(nextEntry.item.NAME, EQUALS_FACADE_NAME);
  return equalsFacade.equals(previousEntry.item, nextEntry.item);
}

function * compareFolders(
  previous: ConfigFolder | undefined,
  next: ConfigFolder,
  parentPath: FullyQualifiedPath,
): Iterable<ConfigChange> {
  // Find all changed and deleted entries
  if (previous) {
    for (const [key, previousEntry] of Object.entries(previous.entries)) {
      const nextEntry = next.entries[key];
      if (nextEntry) {
        // Emit an update for this entry if it has changed
        if (!entryItemsAreEqual(previousEntry, nextEntry)) {
          yield { type: 'update', entry: nextEntry.item, path: [...parentPath, key] };
        }

        // Compare all children of the two entries
        yield * compareFolders(previousEntry.children, nextEntry.children, [...parentPath, key]);
      } else {
        yield { type: 'delete', path: [...parentPath, key] };
      }
    }
  }

  // Find all created entries
  for (const [key, nextEntry] of Object.entries(next.entries)) {
    const previousEntry = previous ? previous.entries[key] : undefined;
    if (!previousEntry) {
      const entryPath = [...parentPath, key];
      yield { type: 'create', entry: nextEntry.item, path: entryPath };
      yield * compareFolders(undefined, nextEntry.children, entryPath);
    }
  }
}

function detectChanges(rootConfigFolder: Observable<ConfigFolder>): Observable<ConfigChange> {
  return rootConfigFolder.pipe(
    pairwise(),
    concatMap(function * ([previous, next]): Iterable<ConfigChange> {
      yield * compareFolders(previous, next, []);
    }),
  );
}

function lookup<T>(map: { [k: string]: T }, key: string): T | undefined {
  return map[key];
}

const mapEventsToLifecycle = (
  basePath: FullyQualifiedPath
) => (
  changes$: Observable<ConfigChange>,
): Observable<ConfigLifecycle<AllComponentConfigurations>> => {
  const storage: { [k: string]: [AllComponentConfigurations['NAME'], Subject<AllComponentConfigurations>] } = {};

  return changes$.pipe(
    concatMap((configChange): [ConfigLifecycle<AllComponentConfigurations>] | [] => {
      const configChangeId = configChange.path.join('/');

      // Check if this id is new
      const existing = lookup(storage, configChangeId);
      if (!existing) {
        assert(
          configChange.type === 'create',
          `Found a config ${configChange.type} event without the item existing in lifecycle storage`,
        );

        // Create and return a new observable
        const subject = new Subject<any>();
        storage[configChangeId] = [configChange.entry.NAME, subject];

        return [{
          path: [...basePath, ...configChange.path],
          name: configChange.entry.NAME,
          events$: subject.pipe(startWith(configChange.entry))
        }];
      }

      // Update an existing entry
      const [name, subject] = existing;
      if (configChange.type === 'create') {
        console.error(`Duplicate create event sent for ${configChangeId}`);
      } else if (configChange.type === 'delete') {
        subject.complete();
        delete storage[configChangeId];
      } else {
        if (configChange.entry.NAME !== name) {
          console.error(`Incorrect entry type for ${configChangeId}`);
        } else {
          subject.next(configChange.entry);
        }
      }

      // Return nothing since there are no new states
      return [];
    }),
  );
};

export const dispatchConfigFolderChanges = (
  basePath: FullyQualifiedPath,
  componentOperator: (lifecycle: ConfigLifecycle<AllComponentConfigurations>) => Observable<void>,
) => (
  configFolder$: Observable<ConfigFolder>,
): Observable<never> => {
  return configFolder$.pipe(
    // Compare the new state to the previous. Only include creates, updates or deletions
    detectChanges,
    // Store an internal state of each config entry
    mapEventsToLifecycle(basePath),
    // Emit the changes to each state entry to a configured handler based on the entry type
    mergeMap(componentOperator),
    ignoreElements(),
  );
}
