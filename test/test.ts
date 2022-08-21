import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { ProcessManager } from '../src/core/process-manager';
import { CoreApi } from '../src/core/api/core-api';
import { METADATA_DISPATCHER_FACADE_FLAG } from '../src/facades/metadata-dispatcher-facade';
import { MetadataDispatcher } from '../src/core/metadata-state/metadata-dispatcher';
import {
  InMemoryDistributedMetadata,
  InMemoryDistributedMetadataHub
} from './scaffolding/in-memory-distributed-metadata';
import { range } from 'lodash';
import { DistributedMetadataFactory } from '../src/types/distributed-metadata-factory';
import { combinedRouter, AnyRequest } from '../src/core/routers/combined-router';
import { InMemoryRpcInterface } from './scaffolding/in-memory-rpc-interface';
import { RequestCategory } from '../src/core/routers/scaffolding/request-category';
import {
  KeyValueConfigAction,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../src/core/routers/key-value-config-request';
import { BehaviorSubject } from 'rxjs';
import { SimpleMemoryKeyValueEntry } from '../src/components/simple-memory-key-value-datastore/simple-memory-key-value-entry';
import { ConfigActionGroupName } from '../src/core/routers/scaffolding/base-config-action-request';

describe('database', () => {
  it('works', async () => {
    // Create test specific in memory components
    const distributedMetadataHub = new InMemoryDistributedMetadataHub('node0');
    const distributedMetadataFactory: DistributedMetadataFactory = {
      async createDistributedMetadata(nodeId: string): Promise<InMemoryDistributedMetadata> {
        return new InMemoryDistributedMetadata(nodeId, distributedMetadataHub);
      }
    }
    const rpcInterface = new InMemoryRpcInterface();
    const nodes$ = new BehaviorSubject<string[]>([]);

    // Create 3 nodes
    const nodes = await Promise.all(range(3).map(async (index) => {
      const nodeId = `node${index}`;
      const processManager = await ProcessManager.initialize();
      const coreApi = await CoreApi.initialize(nodeId, processManager, distributedMetadataFactory, rpcInterface, nodes$);

      // Bootstrap a new cluster
      const dispatcherId = await coreApi.joinMetadataCluster([]);
      const dispatcher = processManager.getProcessByIdAs(dispatcherId, METADATA_DISPATCHER_FACADE_FLAG)!;
      expect(dispatcher).toBeInstanceOf(MetadataDispatcher);

      // Create the router
      const router = combinedRouter(
        nodeId,
        rpcInterface,
        dispatcher,
        processManager,
      );
      rpcInterface.registerRouter(nodeId, router);

      return { nodeId, processManager, coreApi, dispatcher, router };
    }));

    nodes$.next(nodes.map(node => node.nodeId));

    // Create a key value data store
    const keyValueDatasetPath = ['dataset1'];
    const keyValueDataset = new SimpleMemoryKeyValueEntry(keyValueDatasetPath);
    await nodes[0].coreApi.putEntry(keyValueDataset);

    // Fetch the entry from a different node
    const retrievedEntry = await nodes[1].coreApi.getEntry(keyValueDatasetPath);
    expect(retrievedEntry).toEqual(keyValueDataset)

    // Small delay
    await new Promise(r => setTimeout(r, 10));

    // Write something to the key value datastore
    const value = Buffer.from('hello');
    const putRequest: KeyValueConfigPutRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigActionGroupName.KeyValue,
      target: keyValueDatasetPath,
      action: KeyValueConfigAction.Put,
      key: 'a',
      value: Buffer.from(value),
    };
    await nodes[0].router(putRequest);

    // Get the key from the same node
    const getRequest: KeyValueConfigGetRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigActionGroupName.KeyValue,
      target: keyValueDatasetPath,
      action: KeyValueConfigAction.Get,
      key: 'a',
    };
    const node0Response = await nodes[0].router(getRequest);
    expect(node0Response).toEqual(value);

    // Get the key from a different node
    const node1Response = await nodes[1].router(getRequest);
    expect(node1Response).toEqual(value);
  });
});
