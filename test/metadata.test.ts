import { RequestCategory } from '../src/routing/types/request-category';
import { MetadataTemporaryAction } from '../src/routing/requests/metadata-temporary/metadata-temporary-request';
import { ConfigEntryCodec } from '../src/core/commit-log/config-entry-codec';
import { ClusterNode } from '../src/main/options';
import { createCluster } from './scaffolding/create-cluster';
import { makeRequest } from './scaffolding/make-request';
import {
  SimpleInMemoryKeyValueConfiguration
} from '../src/components/simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import { EQUALS_FACADE_NAME } from '../src/facades/equals-facade';
import { ComponentName } from '../src/components/scaffolding/component-name';
import {
  SimpleInMemoryKeyValueFacades
} from '../src/components/simple-memory-key-value-datastore/simple-in-memory-key-value-facades';

describe('Metadata e2e', () => {
  let cluster: { node0: ClusterNode, node1: ClusterNode, node2: ClusterNode };
  let cleanup: (() => Promise<void>);

  beforeEach(async () => {
    [cluster, cleanup] = await createCluster(3, 20);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('can create and retrieve metadata items', async () => {
    // Retrieve an item that doesn't exist
    const datasetPath = ['dataset'];
    const getMissingConfigResponse = await makeRequest(cluster.node0, {
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Get,
      path: datasetPath,
    });
    expect(getMissingConfigResponse).toBe('');

    const keyValueDataset = new SimpleInMemoryKeyValueConfiguration();
    const putKeyValueConfigResponse = await makeRequest(cluster.node0, {
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Put,
      path: datasetPath,
      entry: await new ConfigEntryCodec().serialize(keyValueDataset),
    });
    expect(putKeyValueConfigResponse).not.toMatch('Error');

    // Retrieve an item that does exist from each of the nodes in the cluster
    for (const node of Object.values(cluster)) {
      const getConfigResponse = await makeRequest(node, {
        category: RequestCategory.MetadataTemporary,
        action: MetadataTemporaryAction.Get,
        path: datasetPath,
      });
      expect(getConfigResponse).not.toMatch('Error');
      const deserializedEntry = await new ConfigEntryCodec().deserialize(getConfigResponse);
      expect(deserializedEntry).toBeDefined();
      expect(deserializedEntry!.NAME).toBe(ComponentName.SimpleMemoryKeyValue);

      const keyValueEqualsFacade = SimpleInMemoryKeyValueFacades[EQUALS_FACADE_NAME];
      expect(keyValueEqualsFacade.equals(keyValueDataset, deserializedEntry as SimpleInMemoryKeyValueConfiguration)).toBe(true);
    }
  });
});
