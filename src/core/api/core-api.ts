import { ConfigEntry, FullyQualifiedPath } from '../../types/config';
import { ProcessManager } from '../process-manager';
import { MetadataDispatcher } from '../metadata-state/metadata-dispatcher';
import { METADATA_DISPATCHER_FACADE_FLAG } from '../../facades/metadata-dispatcher-facade';

export class CoreApi {
  public static async initialize(
    nodeId: string,
    processManager: ProcessManager,
    // metadataManager: MetadataManager,
  ): Promise<CoreApi> {
    return new CoreApi(nodeId, processManager);
  }

  private constructor(
    private readonly nodeId: string,
    private readonly processManager: ProcessManager,
    // private readonly metadataManager: MetadataManager,
  ) {}

  public async bootstrapMetadataCluster(): Promise<void> {
    const path: FullyQualifiedPath = [];
    const metadataDispatcher = await MetadataDispatcher.initialize(
      this.nodeId,
      path,
      this.processManager,
      true,
    );
    this.processManager.register(path, metadataDispatcher);
  }

  public async joinMetadataCluster(path: FullyQualifiedPath): Promise<void> {
    const metadataDispatcher = await MetadataDispatcher.initialize(
      this.nodeId,
      path,
      this.processManager,
      false,
    );
    this.processManager.register(path, metadataDispatcher);
  }

  public async getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined> {
    // Find the matching metadata dispatcher
    const dispatchers = this.processManager.getAllProcessesByFlag(METADATA_DISPATCHER_FACADE_FLAG);
    const parentDispatcher = dispatchers.find(dispatcher => dispatcher.containsPath(path));
    if (!parentDispatcher) {
      throw new Error(`Could not find parent dispatcher for entry at ${path.join('/')}`);
    }

    return parentDispatcher.getEntry(path);
  }

  public async putEntry(entry: ConfigEntry): Promise<void> {
    // Find the matching metadata dispatcher
    const dispatchers = this.processManager.getAllProcessesByFlag(METADATA_DISPATCHER_FACADE_FLAG);
    const parentDispatcher = dispatchers.find(dispatcher => dispatcher.ownsPath(entry.id));
    if (!parentDispatcher) {
      throw new Error(`Could not find parent dispatcher for entry at ${entry.id.join('/')}`);
    }

    await parentDispatcher.putEntry(entry);
  }
}
