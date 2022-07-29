import { concat, Observable, Subject } from 'rxjs';
import { concatMap, finalize, ignoreElements, map, mergeMap, pairwise, startWith } from 'rxjs/operators';
import { ProcessManager } from '../process-manager';
import { ConfigEntry, ConfigEntryName, FullyQualifiedPath } from '../../types/config';
import { MetadataServer } from './metadata-server';
import { componentInitializers } from '../../components/components';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';
import { METADATA_DISPATCHER_FACADE_FLAG, MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';

interface ConfigCreate {
  type: 'create';
  key: string;
  entry: ConfigEntry;
}

interface ConfigUpdate {
  type: 'update';
  key: string;
  entry: ConfigEntry;
}

interface ConfigDelete {
  type: 'delete';
  key: string;
  entry: ConfigEntry;
}

type ConfigChange = ConfigCreate | ConfigUpdate | ConfigDelete;

const filterRelevantChanges = (isLeader: boolean, nodeId: string) => (configEntries$: Observable<{ [k: string]: ConfigEntry }>): Observable<{ [k: string]: ConfigEntry }> => {
  return configEntries$.pipe(
    map(entries => (
      // TODO add path based filtering if it is a leader
      Object.fromEntries(Object.entries(entries).filter(([key]) => key.startsWith(nodeId)))
    )),
  )
};

function detectChanges(configEntries$: Observable<{ [k: string]: ConfigEntry }>): Observable<ConfigChange> {
  return configEntries$.pipe(
    pairwise(),
    concatMap(([previous, next]) => {
      // TODO
      return [];
    }),
  );
}

function lookup<T>(map: { [k: string]: T }, key: string): T | undefined {
  return map[key];
}

interface ConfigLifecycle<T extends ConfigEntry> {
  key: string;
  name: T['name'];
  events$: Observable<T>;
}

const mapEventsToLifecycle = (
  changes$: Observable<ConfigChange>,
): Observable<ConfigLifecycle<ConfigEntry>> => {
  const storage: { [k: string]: [ConfigEntry['name'], Subject<ConfigEntry>] } = {};

  return changes$.pipe(
    concatMap((configChange): [ConfigLifecycle<ConfigEntry>] | [] => {

      const existing = lookup(storage, configChange.key);
      if (!existing) {
        // Create and return a new observable
        const subject = new Subject<any>();

        storage[configChange.key] = [configChange.entry.name, subject];

        return [{
          key: configChange.key,
          name: configChange.entry.name,
          events$: subject.pipe(startWith(configChange.entry))
        }];
      }

      // Update an existing entry
      const [name, subject] = existing;
      if (configChange.type === 'create') {
        console.error(`Duplicate create event sent for ${configChange.key}`);
      } else if (configChange.type === 'delete') {
        subject.complete();
        delete storage[configChange.key];
      } else {
        if (configChange.entry.name !== name) {
          console.error(`Incorrect entry type for ${configChange.key}`);
        } else {
          subject.next(configChange.entry);
        }
      }

      // Return nothing since there are no new states
      return [];
    }),
  );
}

async function initializeProcess(processManager: ProcessManager, lifecycle: ConfigLifecycle<ConfigEntry>) {
  const component = await componentInitializers[lifecycle.name](lifecycle.key, lifecycle.events$ as Observable<any>);
  // TODO handle splits better
  processManager.register(lifecycle.key.split('/'), component);
  return component;
}

function cleanupProcess(processManager: ProcessManager, lifecycle: ConfigLifecycle<ConfigEntry>) {
  return lifecycle.events$.pipe(
    finalize(() => {
      processManager.deregister(lifecycle.key.split('/'));
    }),
  );
}

const dispatchChangeToHandlers = (
  processManager: ProcessManager,
) => (lifecycles$: Observable<ConfigLifecycle<ConfigEntry>>): Observable<never> => {
  return lifecycles$.pipe(
    mergeMap(lifecycle => concat(
      initializeProcess(processManager, lifecycle),
      cleanupProcess(processManager, lifecycle),
    )),
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
    isLeader: boolean,
    // metadataManager: MetadataManager,
  ): Promise<MetadataDispatcher> {
    const server = await MetadataServer.initialize();
    return new MetadataDispatcher(nodeId, path, processManager, server, isLeader);
  }

  // Subscribe to the config and start child processes
  private readonly subscription = this.server.config$.pipe(
    map(config => config.entries),
    // Only include entries that are assigned to this node
    filterRelevantChanges(this.isLeader, this.nodeId),
    // Compare the new state to the previous. Only include changes or deletions
    detectChanges,
    mapEventsToLifecycle,
    // Start a specific process or trigger an update on an existing one
    dispatchChangeToHandlers(this.processManager),
  ).subscribe();

  private constructor(
    // Is used in the filtering logic to determine what changes this dispatcher needs to react to
    private readonly nodeId: string,
    private readonly path: FullyQualifiedPath,
    private readonly processManager: ProcessManager,
    // private readonly metadataManager: MetadataManager,
    private readonly server: MetadataServer,
    private readonly isLeader: boolean,
  ) {}

  containsPath(path: FullyQualifiedPath): boolean {
    if (path.length <= this.path.length) {
      return false;
    }

    const firstHalf = path.slice(0, this.path.length);
    if (firstHalf.join('/') !== this.path.join('/')) {
      return false;
    }

    const remainingHalf = path.slice(this.path.length);
    const remainingString = remainingHalf.join('/');
    return !Object.entries(this.server.currentConfig.entries)
      .some(([entryKey, entryValue]) => (
        entryValue.name === ConfigEntryName.MetadataGroup && remainingString.startsWith(entryKey)
      ));
  }

  ownsPath(path: FullyQualifiedPath): boolean {
    return this.isLeader && this.containsPath(path);
  }

  async getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined> {
    return this.server.currentConfig.entries[path.join('/')];
  }

  async putEntry(entry: ConfigEntry): Promise<void> {
    return this.server.publish(entry);
  }

  async cleanup() {
    this.subscription.unsubscribe();
  }
}

// export function startMetadataDispatcher(
//   // nodeList$: Observable<string[]>,
//   nodeId: string,
//   processManager: ProcessManager,
// ): () => void {
//   const [config$, stopMetadataServer] = startMetadataServer();
//
//   // Subscribe to the config and start child processes
//   const subscription = config$.pipe(
//     map(config => config.entries),
//     // Only include entries that are assigned to this node
//     filterRelevantChanges(nodeId),
//     // Compare the new state to the previous. Only include changes or deletions
//     detectChanges,
//     // Start a specific process or trigger an update on an existing one
//     dispatchChangeToHandlers(processManager),
//   ).subscribe();
//
//
//   return () => {
//     stopMetadataServer();
//     subscription.unsubscribe();
//   };
// }
