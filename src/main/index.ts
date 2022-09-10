import { ProcessManager } from '../core/process-manager';
import { CoreApi } from '../core/api/core-api';

interface MainOptions {
  nodeId: string;
  apiPort: number;
}

export async function main(mainOptions: MainOptions): Promise<() => Promise<void>> {
  // Create a process manager to store all datastore components
  const processManager = await ProcessManager.initialize();

  // Create a metadata manager to store the different metadata membership groups
  // const metadataManager = await MetadataManager.initialize();

  // State the core api
  const coreApi = await CoreApi.initialize(mainOptions.nodeId, processManager);

  // Start the rest api
  // TODO
  // const restApiOptions = { port: mainOptions.apiPort, host: 'localhost' };
  // const closeRestApi = await startRestApi(restApiOptions, coreApi);

  // Clean up all resources
  return async () => {
    // await closeRestApi();
  };
}
