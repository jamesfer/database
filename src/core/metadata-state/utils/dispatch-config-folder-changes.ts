import { ConfigFolder, FullyQualifiedPath } from '../../../config/config';
import { ConfigEntry } from '../../../config/config-entry';
import { Observable, Subject } from 'rxjs';
import { AnyConfigLifecycle, ComponentOperator } from '../../../components/scaffolding/component-operator';
import { concatMap, ignoreElements, mergeMap, pairwise, startWith, tap } from 'rxjs/operators';

interface ConfigCreate {
  type: 'create';
  path: FullyQualifiedPath;
  entry: ConfigEntry;
}

interface ConfigUpdate {
  type: 'update';
  path: FullyQualifiedPath;
  entry: ConfigEntry;
}

interface ConfigDelete {
  type: 'delete';
  path: FullyQualifiedPath;
}

type ConfigChange = ConfigCreate | ConfigUpdate | ConfigDelete;

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
        if (nextEntry.item.name !== previousEntry.item.name || !nextEntry.item.equals(previousEntry.item as any)) {
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
): Observable<AnyConfigLifecycle> => {
  const storage: { [k: string]: [ConfigEntry['name'], Subject<ConfigEntry>] } = {};
  return changes$.pipe(
    concatMap((configChange): [AnyConfigLifecycle] | [] => {
      const configChangeId = configChange.path.join('/');
      const existing = lookup(storage, configChangeId);
      if (!existing) {
        if (configChange.type !== 'create') {
          throw new Error('Found a config ' + configChange.type + ' event without the item existing in lifecycle storage');
        }

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

export const dispatchChangeToHandlers = (
  allComponentOperator: ComponentOperator<any>,
) => (lifecycles$: Observable<AnyConfigLifecycle>): Observable<never> => {
  return lifecycles$.pipe(
    mergeMap(allComponentOperator),
    ignoreElements(),
  );
};

export const dispatchConfigFolderChanges = (
  basePath: FullyQualifiedPath,
  allComponentOperator: ComponentOperator<any>,
) => (
  configFolder$: Observable<ConfigFolder>,
): Observable<never> => {
  return configFolder$.pipe(
    // Compare the new state to the previous. Only include creates, updates or deletions
    detectChanges,
    // Store an internal state of each config entry
    mapEventsToLifecycle(basePath),
    // Emit the changes to each state entry to a configured handler based on the entry type
    dispatchChangeToHandlers(allComponentOperator),
  );
}
