import { ProcessManager } from '../process-manager';
import { MetadataDispatcher } from '../metadata-state/metadata-dispatcher';
import { DistributedCommitLogFactory } from '../../types/distributed-commit-log-factory';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { Observable } from 'rxjs';
import { FullyQualifiedPath } from '../../config/config';
import { ConfigEntry } from '../../config/config-entry';
import { MetadataManager } from '../metadata-state/metadata-manager';

export class CoreApi {
  public static async initialize(
    nodeId: string,
    processManager: ProcessManager,
    metadataManager: MetadataManager,
    distributedCommitLogFactory: DistributedCommitLogFactory<ConfigEntry>,
    rpcInterface: RpcInterface<AnyRequest>,
    nodes$: Observable<string[]>,
  ): Promise<CoreApi> {
    return new CoreApi(nodeId, processManager, metadataManager, distributedCommitLogFactory, rpcInterface, nodes$);
  }

  private constructor(
    private readonly nodeId: string,
    private readonly processManager: ProcessManager,
    private readonly metadataManager: MetadataManager,
    private readonly distributedCommitLogFactory: DistributedCommitLogFactory<ConfigEntry>,
    private readonly rpcInterface: RpcInterface<AnyRequest>,
    private readonly nodes$: Observable<string[]>,
  ) {}

  // public async bootstrapMetadataCluster(): Promise<string> {
  //   const path: FullyQualifiedPath = [];
  //   const distributedMetadata = await this.distributedMetadataFactory.createDistributedMetadata(this.nodeId)
  //   const metadataDispatcher = await MetadataDispatcher.initialize(
  //     path,
  //     this.processManager,
  //     distributedMetadata,
  //   );
  //
  //   const dispatcherProcessId = uniqueId('metadataClusterLeader');
  //   this.processManager.register(dispatcherProcessId, metadataDispatcher);
  //
  //   return dispatcherProcessId;
  // }

  public async joinMetadataCluster(path: FullyQualifiedPath): Promise<MetadataDispatcher> {
    const distributedMetadata = await this.distributedCommitLogFactory.createDistributedCommitLog(this.nodeId);
    const metadataDispatcher = await MetadataDispatcher.initialize(
      this.nodeId,
      path,
      this.processManager,
      distributedMetadata,
      this.rpcInterface,
      this.nodes$,
    );
    this.metadataManager.registerDispatcher(path, metadataDispatcher);
    return metadataDispatcher;
  }

  public async getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined> {
    // Find the matching metadata dispatcher
    const parentDispatcher = this.metadataManager.getClosestDispatcherMatching(path);
    if (!parentDispatcher || !parentDispatcher.containsPath(path)) {
      throw new Error(`Could not find parent dispatcher for entry at ${path.join('/')}`);
    }

    return parentDispatcher.getEntry(path);
  }

  public async putEntry(path: FullyQualifiedPath, entry: ConfigEntry): Promise<void> {
    // Find the matching metadata dispatcher
    const parentDispatcher = this.metadataManager.getClosestDispatcherMatching(path);
    if (!parentDispatcher || !parentDispatcher.containsPath(path)) {
      throw new Error(`Could not find parent dispatcher for entry at ${path.join('/')}`);
    }

    await parentDispatcher.putEntry(path, entry);
  }
}
