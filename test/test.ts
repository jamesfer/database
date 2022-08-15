import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { ProcessManager } from '../src/core/process-manager';
import { CoreApi } from '../src/core/api/core-api';
import { SimpleMemoryKeyValueEntry } from '../src/types/config';
import { METADATA_DISPATCHER_FACADE_FLAG } from '../src/facades/metadata-dispatcher-facade';
import { MetadataDispatcher } from '../src/core/metadata-state/metadata-dispatcher';
import {
  InMemoryDistributedMetadata,
  InMemoryDistributedMetadataHub
} from './scaffolding/in-memory-distributed-metadata';
import { range } from 'lodash';
import { DistributedMetadataFactory } from '../src/types/distributed-metadata-factory';
import { allRouter, AnyRequest } from '../src/core/routers/all-router';
import { InMemoryRpcInterface } from './scaffolding/in-memory-rpc-interface';
import { AllRouterCategories } from '../src/core/routers/all-router-categories';
import { RequestType } from '../src/core/routers/scaffolding/request';
import {
  KeyValueConfigAction,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../src/core/routers/key-value-config-router';
import { BehaviorSubject } from 'rxjs';

describe('database', () => {
  async function successfulFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const response = await fetch(url, init);
    if (response.status >= 300) {
      throw new Error(`Fetch failed. Status: ${response.status}, body: ${await response.text()}`);
    }
    return response;
  }

  // it('works', async () => {
  //   const cleanup = await main({ port: 3000 });
  //
  //   // Create dataset
  //   await successfulFetch('http://localhost:3000/a/b/dataset', {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       type: 'KeyValue',
  //     }),
  //   });
  //
  //   // Create api
  //   await successfulFetch('http://localhost:3000/a/b/api', {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       type: 'RestApi',
  //       dataset: 'a/b/dataset',
  //     }),
  //   });
  //
  //   // Write to dataset
  //   await successfulFetch('http://localhost:3000/a/b/api/data?key=testKey', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/octet-stream' },
  //     body: Buffer.from('hello'),
  //   });
  //
  //
  //   // Read from dataset
  //   const response = await successfulFetch('http://localhost:3000/a/b/api/data?key=testKey');
  //   const value = await response.buffer();
  //
  //   expect(value).toEqual(Buffer.from('hello'));
  //
  //   await cleanup();
  // });

  it('works', async () => {
    // Create test specific in memory components
    const distributedMetadataHub = new InMemoryDistributedMetadataHub('node0');
    const distributedMetadataFactory: DistributedMetadataFactory = {
      async createDistributedMetadata(nodeId: string): Promise<InMemoryDistributedMetadata> {
        return new InMemoryDistributedMetadata(nodeId, distributedMetadataHub);
      }
    }
    const rpcInterface = new InMemoryRpcInterface<AnyRequest>();
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
      const router = allRouter(
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
      category: AllRouterCategories.KeyValueConfig,
      target: {
        type: RequestType.Path,
        path: keyValueDatasetPath,
      },
      action: KeyValueConfigAction.Put,
      key: 'a',
      value: Buffer.from(value),
    };
    await nodes[0].router(putRequest);

    // Get the key from the same node
    const getRequest: KeyValueConfigGetRequest = {
      category: AllRouterCategories.KeyValueConfig,
      target: {
        type: RequestType.Path,
        path: keyValueDatasetPath,
      },
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
