import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { concatMap, ignoreElements, map, mergeMap, pairwise, startWith, withLatestFrom } from 'rxjs/operators';
import { ProcessManager } from '../process-manager';
import {
  Config,
  ConfigEntry,
  ConfigEntryName,
  ConfigFolder,
  FullyQualifiedPath,
  SelectConfigEntry
} from '../../types/config';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';
import { METADATA_DISPATCHER_FACADE_FLAG, MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { DistributedMetadataFacade } from '../../facades/distributed-metadata-facade';
import { reduceConfigEntriesToConfig } from './utils/reduce-config-entries-to-config';
import { allComponentOperator } from '../../components/all-component-operator';
import { AnyConfigLifecycle } from '../../components/component-operator';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../routers/all-router';

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
  // entry: ConfigEntry;
}

type ConfigChange = ConfigCreate | ConfigUpdate | ConfigDelete;

// const filterRelevantChanges = (
//   nodeId: string,
//   isLeader$: Observable<boolean>,
// ) => (
//   configEntries$: Observable<ConfigFolder>,
// ): Observable<ConfigFolder> => {
//   return configEntries$.pipe(
//     withLatestFrom(isLeader$),
//     tap(([folder, isLeader]) => console.log(`[node:${nodeId}] isLeader: ${isLeader}, folder: ${JSON.stringify(folder)}`)),
//     filter(([, isLeader]) => isLeader),
//     map(([folder]) => folder),
//     // map(folder => (
//     //   isLeader ? folder.entries
//     //   // TODO add path based filtering if it is a leader
//     //   Object.fromEntries(Object.entries(folder.entries).filter(([key]) => isLeader || key.startsWith(nodeId)))
//     // )),
//   )
// };

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

const detectChanges = (isLeader$: Observable<boolean>) => (rootConfigFolder: Observable<ConfigFolder>): Observable<ConfigChange> => {
  return rootConfigFolder.pipe(
    pairwise(),
    withLatestFrom(isLeader$),
    concatMap(function * ([[previous, next], isLeader]): Iterable<ConfigChange> {
      if (!isLeader) {
        return;
      }

      yield * compareFolders(previous, next, []);
    }),
  );
}

function lookup<T>(map: { [k: string]: T }, key: string): T | undefined {
  return map[key];
}

const mapEventsToLifecycle = (
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
}

const dispatchChangeToHandlers = (
  nodeId: string,
  processManager: ProcessManager,
  metadataDispatcher: MetadataDispatcher,
  rpcInterface: RPCInterface<AnyRequest>,
  nodes$: Observable<string[]>,
) => (lifecycles$: Observable<AnyConfigLifecycle>): Observable<never> => {
  return lifecycles$.pipe(
    mergeMap(allComponentOperator(nodeId, processManager, metadataDispatcher, rpcInterface, nodes$)),
    ignoreElements(),
  );
};

export class MetadataDispatcher implements BaseFacade, MetadataDispatcherFacade {
  public readonly [FACADE_FLAGS]: MetadataDispatcherFacade[typeof FACADE_FLAGS] = {
    [METADATA_DISPATCHER_FACADE_FLAG]: this
  };

  static async initialize(
    nodeId: string,
    path: FullyQualifiedPath,
    processManager: ProcessManager,
    // nodeList$: Observable<string[]>,
    distributedMetadata: DistributedMetadataFacade,
    rpcInterface: RPCInterface<AnyRequest>,
    nodes$: Observable<string[]>,
  ): Promise<MetadataDispatcher> {
    // const server = await MetadataServer.initialize();
    return new MetadataDispatcher(nodeId, path, processManager, distributedMetadata, rpcInterface, nodes$);
  }

  private readonly allSubscriptions = new Subscription();

  private readonly isLeader$ = new BehaviorSubject(false);

  private readonly currentConfig$ = new BehaviorSubject(Config.empty());

  private constructor(
    private readonly nodeId: string,
    private readonly path: FullyQualifiedPath,
    private readonly processManager: ProcessManager,
    private readonly distributedMetadata: DistributedMetadataFacade,
    private readonly rpcInterface: RPCInterface<AnyRequest>,
    private readonly nodes$: Observable<string[]>,
    // private readonly server: MetadataServer,
    // private readonly isLeader: boolean,
  ) {
    this.distributedMetadata.commits$.pipe(
      reduceConfigEntriesToConfig,
    ).subscribe(this.currentConfig$);

    // Subscribe to the config and start child processes
    this.allSubscriptions.add(this.currentConfig$.pipe(
      map(config => config.rootFolder),
      // TODO only select entries that this node is a leader of, or they are assigned with @nodeId
      // filterRelevantChanges(this.nodeId, this.isLeader$),
      // Compare the new state to the previous. Only include creates, updates or deletions
      detectChanges(this.isLeader$),
      // Store an internal state of each config entry
      mapEventsToLifecycle,
      // Emit the changes to each state entry to a configured handler based on the entry type
      dispatchChangeToHandlers(this.nodeId, this.processManager, this, this.rpcInterface, this.nodes$),
    ).subscribe());

    this.allSubscriptions.add(this.distributedMetadata.isLeader$.subscribe(this.isLeader$));
  }

  containsPath(path: FullyQualifiedPath): boolean {
    const firstHalf = path.slice(0, this.path.length);
    if (firstHalf.join('/') !== this.path.join('/')) {
      return false;
    }

    const pathToDirectory = path.slice(this.path.length, -1);
    if (pathToDirectory.length === 0) {
      // The path points to an entry in the root directory
      return true;
    }

    const configParent = this.findEntry(pathToDirectory);
    return (configParent !== undefined && configParent.name !== ConfigEntryName.MetadataGroup);
  }

  ownsPath(path: FullyQualifiedPath): boolean {
    return this.isLeader$.getValue() && this.containsPath(path);
  }

  async getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined> {
    return this.findEntry(path);
  }

  async getEntryAs<N extends ConfigEntryName>(path: FullyQualifiedPath, name: N): Promise<SelectConfigEntry<N>> {
    const entry = await this.getEntry(path);
    if (!entry) {
      throw new Error(`Could not find config entry at path: ${path.join('/')}`)
    }

    if (entry.name !== name) {
      throw new Error(`Tried to get a config entry as the incorrect type. Config type: ${entry.name}, expected type: ${name}`);
    }

    // We have to use a cast here because Typescript can't correctly infer the type with a generic parameter
    return entry as SelectConfigEntry<N>;
  }

  async putEntry(entry: ConfigEntry): Promise<void> {
    return this.distributedMetadata.write(entry);
  }

  async cleanup() {
    this.allSubscriptions.unsubscribe();
  }

  private findEntry(path: FullyQualifiedPath): ConfigEntry | undefined {
    const config = this.currentConfig$.getValue()
    let [nextPathSegment, ...remainingPath] = path;
    if (!nextPathSegment) {
      // The given path points to this exact metadata group
      return;
    }

    let configFolder = config.rootFolder;
    while (true) {
      const entry = configFolder.entries[nextPathSegment];
      if (!entry) {
        return;
      }

      [nextPathSegment, ...remainingPath] = remainingPath;
      if (!nextPathSegment) {
        // There is no more path yet, we've found the entry that we're looking for
        return entry.item;
      }

      configFolder = entry.children;
    }
  }
}
