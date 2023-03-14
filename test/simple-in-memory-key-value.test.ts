import { createCluster } from './scaffolding/create-cluster';
import { ClusterNode } from '../src/main/options';
import {
  HashPartitionConfiguration
} from '../src/components/hash-partition/main-component/hash-partition-configuration';
import {
  SimpleInMemoryKeyValueConfiguration
} from '../src/components/simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import { RequestCategory } from '../src/routing/types/request-category';
import { MetadataTemporaryAction } from '../src/routing/requests/metadata-temporary/metadata-temporary-request';
import { ConfigEntryCodec } from '../src/core/commit-log/config-entry-codec';
import {
  KeyValueConfigAddressedRequestAction,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../src/routing/requests/config-addressed/key-value-config-addressed-request';
import { ConfigAddressedGroupName } from '../src/routing/requests/config-addressed/base-config-addressed-request';
import { makeRequest } from './scaffolding/make-request';
import { waitUntilComponentReadyOnAllNodes } from './scaffolding/wait-until-component-ready-on-all-nodes';

describe('SimpleInMemoryKeyValue e2e', () => {
  let cluster: { node0: ClusterNode, node1: ClusterNode, node2: ClusterNode };
  let cleanup: (() => Promise<void>);

  beforeEach(async () => {
    [cluster, cleanup] = await createCluster(3, 30);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('reads and writes values in memory', async () => {
    // Create a key value data store
    const keyValueDatasetPath = ['dataset1'];
    const keyValueDataset = new SimpleInMemoryKeyValueConfiguration();
    const putKeyValueConfigResponse = await makeRequest(cluster.node0, {
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Put,
      path: keyValueDatasetPath,
      entry: await new ConfigEntryCodec().serialize(keyValueDataset),
    });
    expect(putKeyValueConfigResponse).not.toMatch('Error');

    await waitUntilComponentReadyOnAllNodes(Object.values(cluster), keyValueDatasetPath);

    // Write something to the key value datastore
    const key = 'a';
    const value = 'hello';
    const putRequest: KeyValueConfigPutRequest = {
      key,
      value,
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.KeyValue,
      target: keyValueDatasetPath,
      action: KeyValueConfigAddressedRequestAction.Put,
    };
    const putKeyValueResponse = await makeRequest(cluster.node0, putRequest);
    expect(putKeyValueResponse).not.toMatch('Error');

    // Small delay
    await new Promise(r => setTimeout(r, 10));

    // Get the key from the same node
    const getRequest: KeyValueConfigGetRequest = {
      key,
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.KeyValue,
      target: keyValueDatasetPath,
      action: KeyValueConfigAddressedRequestAction.Get,
    };
    const node0Response = await makeRequest(cluster.node0, getRequest);
    expect(node0Response).not.toMatch('Error');
    expect(node0Response).toEqual(value);

    // Get the key from a different node
    const node1Response = await makeRequest(cluster.node1, getRequest);
    expect(node1Response).not.toMatch('Error');
    expect(node1Response).toEqual(value);
  });
});
