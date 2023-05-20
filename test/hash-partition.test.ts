import { createCluster } from './scaffolding/create-cluster';
import { ClusterNode } from '../src/main/options';
import {
  HashPartitionConfiguration
} from '../src/components/hash-partition/main-component/hash-partition-configuration';
import {
  SimpleInMemoryKeyValueConfiguration
} from '../src/components/simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import { RequestCategory } from '../src/routing/actions/request-category';
import { MetadataTemporaryAction } from '../src/routing/actions/metadata-temporary/metadata-temporary-request';
import { ConfigEntryCodec } from '../src/core/commit-log/config-entry-codec';
import { ConfigAddressedGroupName } from '../src/routing/actions/config-addressed/base-config-addressed-request';
import { makeRequest } from './scaffolding/make-request';
import { KeyValueConfigGetRequest } from '../src/routing/actions/config-addressed/key-value/get';
import { KeyValueConfigPutRequest } from '../src/routing/actions/config-addressed/key-value/put';
import {
  KeyValueConfigAddressedRequestActionType
} from '../src/routing/actions/config-addressed/key-value/base-request';

describe('HashPartition e2e', () => {
  let cluster: { node0: ClusterNode, node1: ClusterNode, node2: ClusterNode };
  let cleanup: (() => Promise<void>);

  beforeEach(async () => {
    [cluster, cleanup] = await createCluster(3, 10);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('reads and writes values to multiple partitions', async () => {
    // Create a hash partition datastore
    const hashPartitionDatasetPath = ['dataset2'];
    const hashPartitionConfig = new HashPartitionConfiguration(5, {
      config: new SimpleInMemoryKeyValueConfiguration(),
    });
    const createHashPartitionResponse = await makeRequest(cluster.node0, {
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Put,
      path: hashPartitionDatasetPath,
      entry: await new ConfigEntryCodec().serialize(hashPartitionConfig),
    });
    expect(createHashPartitionResponse).not.toMatch('Error');

    // Small delay
    await new Promise(r => setTimeout(r, 100));

    // Write values to the hash partition datastore
    const value = 'string';
    for (let i = 0; i < 10; i++) {
      const putRequest: KeyValueConfigPutRequest = {
        category: RequestCategory.Config,
        group: ConfigAddressedGroupName.KeyValue,
        target: hashPartitionDatasetPath,
        action: KeyValueConfigAddressedRequestActionType.Put,
        key: `key${i}`,
        value,
      };
      const response = await makeRequest(cluster.node2, putRequest);
      expect(response).not.toMatch('Error');
    }

    // Small delay
    await new Promise(r => setTimeout(r, 10));

    // Read values from the hash partition datastore
    for (let i = 0; i < 10; i++) {
      const getRequest: KeyValueConfigGetRequest = {
        category: RequestCategory.Config,
        group: ConfigAddressedGroupName.KeyValue,
        target: hashPartitionDatasetPath,
        action: KeyValueConfigAddressedRequestActionType.Get,
        key: `key${i}`,
      };
      const response = await makeRequest(cluster.node1, getRequest);
      expect(response).not.toMatch('Error');
      expect(response).toEqual(value);
    }
  });
});
