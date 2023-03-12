import { ProcessManager } from '../src/core/process-manager';
import {
  InMemoryCommitLog,
  InMemoryCommitLogHub
} from './scaffolding/in-memory-commit-log';
import { find, range } from 'lodash';
import { DistributedCommitLogFactory } from '../src/types/distributed-commit-log-factory';
import { anyRequestRouter } from '../src/routing/any-request-router';
import { InMemoryRpcInterface } from './scaffolding/in-memory-rpc-interface';
import { RequestCategory } from '../src/routing/types/request-category';
import {
  KeyValueConfigAddressedRequestAction,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../src/routing/requests/config-addressed/key-value-config-addressed-request';
import { BehaviorSubject } from 'rxjs';
import { ConfigAddressedGroupName } from '../src/routing/requests/config-addressed/base-config-addressed-request';
import { MetadataManager } from '../src/core/metadata-state/metadata-manager';
import { MetadataTemporaryAction } from '../src/routing/requests/metadata-temporary/metadata-temporary-request';
import {
  SimpleInMemoryKeyValueConfiguration
} from '../src/components/simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import { HashPartitionConfiguration } from '../src/components/hash-partition/main-component/hash-partition-configuration';
import { ClusterNode } from '../src/main/options';
import { start } from '../src/main/start';
import fetch from 'node-fetch';
import { ConfigEntryCodec } from '../src/core/commit-log/config-entry-codec';
import { AllComponentConfigurations } from '../src/components/scaffolding/all-component-configurations';
import { AnyRequest, AnyRequestCodec } from '../src/routing/requests/any-request';

describe('database', () => {
  it('runs a simple scenario with the in memory links', async () => {
    // Create test specific in memory components
    const distributedMetadataHub = new InMemoryCommitLogHub('node0');
    const distributedCommitLogFactory: DistributedCommitLogFactory<AllComponentConfigurations> = {
      async createDistributedCommitLog(nodeId: string): Promise<InMemoryCommitLog> {
        return new InMemoryCommitLog(nodeId, distributedMetadataHub);
      }
    }
    const rpcInterface = new InMemoryRpcInterface();
    const nodes$ = new BehaviorSubject<string[]>([]);

    // Create 3 nodes
    const nodes = await Promise.all(range(3).map(async (index) => {
      const nodeId = `node${index}`;

      // Create managers
      const processManager = await ProcessManager.initialize();
      const metadataManager = await MetadataManager.initialize();

      // Create the router
      const router = anyRequestRouter(
        nodeId,
        rpcInterface,
        processManager,
        metadataManager,
        distributedCommitLogFactory,
        nodes$,
      );
      rpcInterface.registerRouter(nodeId, router);

      // Bootstrap a metadata dispatcher
      await rpcInterface.makeRequest({
        category: RequestCategory.MetadataTemporary,
        action: MetadataTemporaryAction.Bootstrap,
        path: [],
      });

      return { nodeId, processManager, router };
    }));

    nodes$.next(nodes.map(node => node.nodeId));

    // Create a key value data store
    const keyValueDatasetPath = ['dataset1'];
    const keyValueDataset = new SimpleInMemoryKeyValueConfiguration();
    await rpcInterface.makeRequest({
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Put,
      path: keyValueDatasetPath,
      entry: await new ConfigEntryCodec().serialize(keyValueDataset),
    });

    // Small delay
    await new Promise(r => setTimeout(r, 10));

    // Fetch the entry from a different node
    const retrievedEntry = await rpcInterface.makeRequest({
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Get,
      path: keyValueDatasetPath,
    });
    expect(await new ConfigEntryCodec().deserialize(retrievedEntry)).toEqual(keyValueDataset)

    // Small delay
    await new Promise(r => setTimeout(r, 10));

    // Write something to the key value datastore
    const value = 'hello';
    const putRequest: KeyValueConfigPutRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.KeyValue,
      target: keyValueDatasetPath,
      action: KeyValueConfigAddressedRequestAction.Put,
      key: 'a',
      value: value,
    };
    await rpcInterface.makeRequest(putRequest);

    // Get the key from the same node
    const getRequest: KeyValueConfigGetRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.KeyValue,
      target: keyValueDatasetPath,
      action: KeyValueConfigAddressedRequestAction.Get,
      key: 'a',
    };
    const node0Response = await nodes[0].router(getRequest);
    expect(node0Response).toEqual(value);

    // Get the key from a different node
    const node1Response = await nodes[1].router(getRequest);
    expect(node1Response).toEqual(value);

    // Create a hash partition datastore
    const hashPartitionDatasetPath = ['dataset2'];
    const hashPartitionConfig = new HashPartitionConfiguration(5, { config: new SimpleInMemoryKeyValueConfiguration() });
    await rpcInterface.makeRequest({
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Put,
      path: hashPartitionDatasetPath,
      entry: await new ConfigEntryCodec().serialize(hashPartitionConfig),
    })

    // Small delay
    await new Promise(r => setTimeout(r, 100));

    // Write values to the hash partition datastore
    for (let i = 0; i < 10; i++) {
      const value = 'hello';
      const key = `key${i}`;
      const putRequest: KeyValueConfigPutRequest = {
        category: RequestCategory.ConfigAction,
        group: ConfigAddressedGroupName.KeyValue,
        target: hashPartitionDatasetPath,
        action: KeyValueConfigAddressedRequestAction.Put,
        key: key,
        value: value,
      };
      await rpcInterface.makeRequest(putRequest);
    }

    // Read values from the hash partition datastore
    for (let i = 0; i < 10; i++) {
      const expectedValue = 'hello';
      const key = `key${i}`;
      const getRequest: KeyValueConfigGetRequest = {
        category: RequestCategory.ConfigAction,
        group: ConfigAddressedGroupName.KeyValue,
        target: hashPartitionDatasetPath,
        action: KeyValueConfigAddressedRequestAction.Get,
        key: key,
      };
      const response = await nodes[2].router(getRequest);
      expect(response).toEqual(expectedValue);
    }
  });
});
