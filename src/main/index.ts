import { startRestApi } from '../apis/rest';
import { MetadataState } from '../core/metadata-state/metadata-state';
import { ResourceRegistry } from '../core';
import { Peers } from '../core/peers';

interface MainOptions {
  port: number;
}

export async function main(mainOptions: MainOptions): Promise<() => Promise<void>> {
  // Create resource registry
  const resources = new ResourceRegistry();

  // Manage peer nodes
  const peers = new Peers();

  // Start gossip protocol
  const metadataState = new MetadataState();
  const stopMetadataState = metadataState.start();

  // Start the rest api
  const closeRestApi = await startRestApi(
    { port: mainOptions.port, host: 'localhost' },
    metadataState,
    resources,
  );

  // Clean up all resources
  // TODO stop the gossip protocol
  return async () => {
    await closeRestApi();
    stopMetadataState();
  }
}
