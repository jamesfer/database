import { ConfigFolder, FullyQualifiedPath } from '../config';
import { Observable, Subject } from 'rxjs';
import { concatMap, ignoreElements, mergeMap, pairwise, startWith } from 'rxjs/operators';
import { assert } from '../../../utils/assert';
import { DistributedOperator } from '../../../interfaces/distributed-operator';
import {
  AnyComponentConfiguration,
  AnyComponentImplementations
} from '../../../components/any-component-configuration';

interface ConfigCreate {
  type: 'create';
  path: FullyQualifiedPath;
  entry: AnyComponentConfiguration;
}

interface ConfigUpdate {
  type: 'update';
  path: FullyQualifiedPath;
  entry: AnyComponentConfiguration;
}

interface ConfigDelete {
  type: 'delete';
  path: FullyQualifiedPath;
}

type ConfigChange = ConfigCreate | ConfigUpdate | ConfigDelete;

interface ConfigLifecycle<C extends AnyComponentConfiguration> {
  path: FullyQualifiedPath,
  name: C['name'];
  events$: Observable<C>;
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
        if (!AnyComponentImplementations.equals(nextEntry.item, previousEntry.item)) {
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
): Observable<ConfigLifecycle<AnyComponentConfiguration>> => {
  const storage: { [k: string]: [AnyComponentConfiguration['name'], Subject<AnyComponentConfiguration>] } = {};

  return changes$.pipe(
    concatMap((configChange): [ConfigLifecycle<AnyComponentConfiguration>] | [] => {
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
        storage[configChangeId] = [configChange.entry.name, subject];

        return [{
          path: [...basePath, ...configChange.path],
          name: configChange.entry.name,
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
        if (configChange.entry.name !== name) {
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
  componentOperator: DistributedOperator<AnyComponentConfiguration>,
) => (
  configFolder$: Observable<ConfigFolder>,
): Observable<never> => {
  return configFolder$.pipe(
    // Compare the new state to the previous. Only include creates, updates or deletions
    detectChanges,
    // Store an internal state of each config entry
    mapEventsToLifecycle(basePath),
    // Emit the changes to each state entry to a configured handler based on the entry type
    mergeMap(lifecycle => {
      return componentOperator.distributedOperator(lifecycle.path, lifecycle.events$);
    }),
    ignoreElements(),
  );
}
