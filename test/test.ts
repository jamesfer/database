import { ProcessManager } from '../src/core/process-manager';
import {
  InMemoryCommitLog,
  InMemoryCommitLogHub
} from './scaffolding/in-memory-commit-log';
import { range } from 'lodash';
import { DistributedCommitLogFactory } from '../src/types/distributed-commit-log-factory';
import { unifiedRequestRouter } from '../src/routing/unified-request-router';
import { InMemoryRpcInterface } from './scaffolding/in-memory-rpc-interface';
import { RequestCategory } from '../src/routing/types/request-category';
import {
  KeyValueConfigAddressedRequestAction,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../src/routing/requests/key-value-config-addressed-request';
import { BehaviorSubject } from 'rxjs';
import { ConfigAddressedGroupName } from '../src/routing/requests/config-addressed/base-config-addressed-request';
import { MetadataManager } from '../src/core/metadata-state/metadata-manager';
import { ConfigEntry } from '../src/config/config-entry';
import { MetadataTemporaryAction } from '../src/routing/requests/metadata-temporary-request';
import { ConfigEntryCodec } from '../src/core/commit-log/config-entry-codec';
import {
  SimpleInMemoryKeyValueConfiguration
} from '../src/components/simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';

describe('database', () => {
  it('runs a simple scenario with the in memory links', async () => {
    // Create test specific in memory components
    const distributedMetadataHub = new InMemoryCommitLogHub('node0');
    const distributedCommitLogFactory: DistributedCommitLogFactory<ConfigEntry> = {
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
      const router = unifiedRequestRouter(
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
        targetNodeId: nodeId,
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
      targetNodeId: 'node0',
      path: keyValueDatasetPath,
      entry: await new ConfigEntryCodec().serialize(keyValueDataset),
    });

    // Fetch the entry from a different node
    const retrievedEntry = await rpcInterface.makeRequest({
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Get,
      targetNodeId: 'node0',
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

    // // Create a hash partition datastore
    // const hashPartitionDatasetPath = ['dataset2'];
    // const hashPartitionConfig = new HashPartitionEntry(5, new SimpleMemoryKeyValueEntry());
    // await rpcInterface.makeRequest({
    //   category: RequestCategory.MetadataTemporary,
    //   action: MetadataTemporaryAction.Put,
    //   targetNodeId: 'node0',
    //   path: hashPartitionDatasetPath,
    //   entry: await new ConfigEntryCodec().serialize(hashPartitionConfig),
    // })
    //
    // // Small delay
    // await new Promise(r => setTimeout(r, 10));
    //
    // // Write values to the hash partition datastore
    // for (let i = 0; i < 10; i++) {
    //   const value = 'hello';
    //   const key = `key${i}`;
    //   const putRequest: KeyValueConfigPutRequest = {
    //     category: RequestCategory.ConfigAction,
    //     group: ConfigAddressedGroupName.KeyValue,
    //     target: hashPartitionDatasetPath,
    //     action: KeyValueConfigAddressedRequestAction.Put,
    //     key: key,
    //     value: value,
    //   };
    //   await rpcInterface.makeRequest(putRequest);
    // }
    //
    // // Read values from the hash partition datastore
    // for (let i = 0; i < 10; i++) {
    //   const expectedValue = 'hello';
    //   const key = `key${i}`;
    //   const getRequest: KeyValueConfigGetRequest = {
    //     category: RequestCategory.ConfigAction,
    //     group: ConfigAddressedGroupName.KeyValue,
    //     target: hashPartitionDatasetPath,
    //     action: KeyValueConfigAddressedRequestAction.Get,
    //     key: key,
    //   };
    //   const response = await nodes[2].router(getRequest);
    //   expect(response).toEqual(expectedValue);
    // }
  });

  // it('runs a simple scenario with the real links', async () => {
  //   const clusterNodes: ClusterNode[] = [
  //     { nodeId: 'node0', host: 'localhost', generalRpcPort: 10000, metadataRpcPort: 10001 },
  //     { nodeId: 'node1', host: 'localhost', generalRpcPort: 11000, metadataRpcPort: 11001 },
  //     { nodeId: 'node2', host: 'localhost', generalRpcPort: 12000, metadataRpcPort: 12001 },
  //   ]
  //   const cleanUpNode0 = await start({
  //     nodeId: 'node0',
  //     leaderId: 'node0',
  //     clusterNodes,
  //   });
  //   const cleanUpNode1 = await start({
  //     nodeId: 'node1',
  //     leaderId: 'node0',
  //     clusterNodes,
  //   });
  //   const cleanUpNode2 = await start({
  //     nodeId: 'node2',
  //     leaderId: 'node0',
  //     clusterNodes,
  //   });
  //
  //   async function makeRequest(nodeId: string, request: AnyRequest, attemptsRemaining = 3): Promise<string> {
  //     const node = find(clusterNodes, { nodeId });
  //     if (!node) {
  //       throw new Error('Node id does not exist in tests');
  //     }
  //
  //     const url = `http://${node.host}:${node.generalRpcPort}`;
  //     const requestString = await new AnyRequestCodec().serialize(request);
  //     const response = await fetch(url, {
  //       method: 'POST',
  //       body: requestString,
  //     });
  //     const textResponse = await response.text();
  //
  //     // Check if the request needs to be retried
  //     if (attemptsRemaining > 0 && /is not ready yet/.test(textResponse)) {
  //       await new Promise(r => setTimeout(r, 50));
  //       return makeRequest(nodeId, request, attemptsRemaining - 1);
  //     }
  //
  //     return textResponse;
  //   }
  //
  //   // Bootstrap each of the nodes
  //   await Promise.all(clusterNodes.map(async node => {
  //     await makeRequest(node.nodeId, {
  //       category: RequestCategory.MetadataTemporary,
  //       action: MetadataTemporaryAction.Bootstrap,
  //       targetNodeId: node.nodeId,
  //       path: [],
  //     });
  //   }));
  //
  //   // Create a key value data store
  //   const keyValueDatasetPath = ['dataset1'];
  //   const keyValueDataset = new SimpleMemoryKeyValueEntry();
  //   const putKeyValueConfigResponse = await makeRequest('node0', {
  //     category: RequestCategory.MetadataTemporary,
  //     action: MetadataTemporaryAction.Put,
  //     targetNodeId: 'node0',
  //     path: keyValueDatasetPath,
  //     entry: await new ConfigEntryCodec().serialize(keyValueDataset),
  //   });
  //   expect(putKeyValueConfigResponse).not.toMatch('Error');
  //
  //   // Small delay
  //   await new Promise(r => setTimeout(r, 10));
  //
  //   // Fetch the entry from a different node
  //   const retrievedEntry = await makeRequest('node1', {
  //     category: RequestCategory.MetadataTemporary,
  //     action: MetadataTemporaryAction.Get,
  //     targetNodeId: 'node1',
  //     path: keyValueDatasetPath,
  //   });
  //   expect(retrievedEntry).not.toMatch('Error');
  //   expect(retrievedEntry).not.toBe('');
  //   const deserializedEntry = await new ConfigEntryCodec().deserialize(retrievedEntry);
  //   expect(deserializedEntry).toEqual(keyValueDataset);
  //
  //   // Small delay
  //   await new Promise(r => setTimeout(r, 10));
  //
  //   // Write something to the key value datastore
  //   const value = 'hello';
  //   const putRequest: KeyValueConfigPutRequest = {
  //     category: RequestCategory.ConfigAction,
  //     group: ConfigAddressedGroupName.KeyValue,
  //     target: keyValueDatasetPath,
  //     action: KeyValueConfigAddressedRequestAction.Put,
  //     key: 'a',
  //     value: value,
  //   };
  //   const putKeyValueResponse = await makeRequest('node0', putRequest);
  //   expect(putKeyValueResponse).not.toMatch('Error');
  //
  //   // Small delay
  //   await new Promise(r => setTimeout(r, 10));
  //
  //   for (let i = 0; i < 3; i++) {
  //     const retrievedEntry = await makeRequest(`node${i}`, {
  //       category: RequestCategory.MetadataTemporary,
  //       action: MetadataTemporaryAction.Get,
  //       targetNodeId: `node${i}`,
  //       path: [...keyValueDatasetPath, 'internal'],
  //     });
  //     // console.log('Retrieved entry', i, retrievedEntry);
  //   }
  //
  //   // Get the key from the same node
  //   const getRequest: KeyValueConfigGetRequest = {
  //     category: RequestCategory.ConfigAction,
  //     group: ConfigAddressedGroupName.KeyValue,
  //     target: keyValueDatasetPath,
  //     action: KeyValueConfigAddressedRequestAction.Get,
  //     key: 'a',
  //   };
  //   const node0Response = await makeRequest('node0', getRequest);
  //   expect(node0Response).not.toMatch('Error');
  //   expect(node0Response).toEqual(value);
  //
  //   // Get the key from a different node
  //   const node1Response = await makeRequest('node1', getRequest);
  //   expect(node1Response).not.toMatch('Error');
  //   expect(node1Response).toEqual(value);
  //
  //   // Create a hash partition datastore
  //   const hashPartitionDatasetPath = ['dataset2'];
  //   const hashPartitionConfig = new HashPartitionEntry(5, new SimpleMemoryKeyValueEntry());
  //   const createHashPartitionResponse = await makeRequest('node0', {
  //     category: RequestCategory.MetadataTemporary,
  //     action: MetadataTemporaryAction.Put,
  //     targetNodeId: 'node0',
  //     path: hashPartitionDatasetPath,
  //     entry: await new ConfigEntryCodec().serialize(hashPartitionConfig),
  //   });
  //   expect(createHashPartitionResponse).not.toMatch('Error');
  //
  //   // Small delay
  //   await new Promise(r => setTimeout(r, 100));
  //
  //   // Write values to the hash partition datastore
  //   const secondValue = 'string';
  //   for (let i = 0; i < 10; i++) {
  //     const key = `key${i}`;
  //     const putRequest: KeyValueConfigPutRequest = {
  //       category: RequestCategory.ConfigAction,
  //       group: ConfigAddressedGroupName.KeyValue,
  //       target: hashPartitionDatasetPath,
  //       action: KeyValueConfigAddressedRequestAction.Put,
  //       key: key,
  //       value: secondValue,
  //     };
  //     const response = await makeRequest('node2', putRequest);
  //     expect(response).not.toMatch('Error');
  //   }
  //
  //   // Small delay
  //   await new Promise(r => setTimeout(r, 10));
  //
  //   // Read values from the hash partition datastore
  //   for (let i = 0; i < 10; i++) {
  //     const key = `key${i}`;
  //     const getRequest: KeyValueConfigGetRequest = {
  //       category: RequestCategory.ConfigAction,
  //       group: ConfigAddressedGroupName.KeyValue,
  //       target: hashPartitionDatasetPath,
  //       action: KeyValueConfigAddressedRequestAction.Get,
  //       key: key,
  //     };
  //     const response = await makeRequest('node1', getRequest);
  //     expect(response).not.toMatch('Error');
  //     expect(response).toEqual(secondValue);
  //   }
  //
  //   await cleanUpNode0();
  //   await cleanUpNode1();
  //   await cleanUpNode2();
  // });
});
