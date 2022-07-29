import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { ProcessManager } from '../src/core/process-manager';
import { CoreApi } from '../src/core/api/core-api';
import { KeyValueDataset } from '../src/types/config';

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
    const processManager = await ProcessManager.initialize();
    const coreApi = await CoreApi.initialize('node-1', processManager);

    // Bootstrap a new cluster
    await coreApi.bootstrapMetadataCluster();

    // Create an entry
    const keyValueDatasetPath = ['dataset1'];
    const keyValueDataset = new KeyValueDataset(keyValueDatasetPath);
    await coreApi.putEntry(keyValueDataset);

    // Fetch the entry
    const retrievedEntry = await coreApi.getEntry(keyValueDatasetPath);
    expect(retrievedEntry).toEqual(keyValueDataset)
  });
});
