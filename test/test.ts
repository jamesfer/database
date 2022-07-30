import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { ProcessManager } from '../src/core/process-manager';
import { CoreApi } from '../src/core/api/core-api';
import { SimpleMemoryKeyValueEntry } from '../src/types/config';
import { KeyValueApi } from '../src/core/api/key-value-api';

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
    const nodeId = 'node-1';
    const processManager = await ProcessManager.initialize();
    const coreApi = await CoreApi.initialize(nodeId, processManager);
    const keyValueApi = await KeyValueApi.initialize(nodeId, processManager);

    // Bootstrap a new cluster
    await coreApi.bootstrapMetadataCluster();

    // Create an entry
    const keyValueDatasetPath = ['dataset1'];
    const keyValueDataset = new SimpleMemoryKeyValueEntry(keyValueDatasetPath);
    await coreApi.putEntry(keyValueDataset);

    // Fetch the entry
    const retrievedEntry = await coreApi.getEntry(keyValueDatasetPath);
    expect(retrievedEntry).toEqual(keyValueDataset)

    // Write something to the datastore
    const value = Buffer.from('hello');
    await keyValueApi.put(keyValueDatasetPath, 'a', Buffer.from(value));

    // Get something from the datastore
    const actual = await keyValueApi.get(keyValueDatasetPath, 'a');
    expect(actual).toEqual(value);
  });
});
