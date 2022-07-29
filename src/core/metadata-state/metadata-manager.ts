import { FullyQualifiedPath } from '../../types/config';
import { MetadataDispatcher } from './metadata-dispatcher';
import { ProcessManager } from '../process-manager';

export class MetadataManager {
  public static async initialize(nodeId: string, processManager: ProcessManager): Promise<MetadataManager> {
    return new MetadataManager(nodeId, processManager);
  }

  private metadataDispatchers: MetadataDispatcher[] = [];

  private constructor(
    private readonly nodeId: string,
    private readonly processManager: ProcessManager,
  ) {

  }

  async addNewDispatcher(path: FullyQualifiedPath, isLeader: boolean): Promise<void> {
    this.metadataDispatchers.push(await MetadataDispatcher.initialize(
      isLeader,
      this.nodeId,
      this.processManager,
      this,
    ));
  }

  findDispatcher(path: FullyQualifiedPath): MetadataDispatcher | undefined {
    // TODO
  }

  // async joinGroup(path: FullyQualifiedPath): Promise<void> {
  //   // Create a new metadata server
  //   const server = await MetadataServer.initialize();
  //
  //   // Create a new dispatcher to watch for changes
  //   const dispatcher = await MetadataDispatcher.initialize();
  // }
}
