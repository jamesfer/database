import { main } from '../src/main';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

describe('database', () => {
  async function successfulFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const response = await fetch(url, init);
    if (response.status >= 300) {
      throw new Error(`Fetch failed. Status: ${response.status}, body: ${await response.text()}`);
    }
    return response;
  }

  it('works', async () => {
    const cleanup = await main({ port: 3000 });

    // Create dataset
    await successfulFetch('http://localhost:3000/a/b/dataset', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'KeyValue',
      }),
    });

    // Create api
    await successfulFetch('http://localhost:3000/a/b/api', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'RestApi',
        dataset: 'a/b/dataset',
      }),
    });

    // Write to dataset
    await successfulFetch('http://localhost:3000/a/b/api/data?key=testKey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: Buffer.from('hello'),
    });


    // Read from dataset
    const response = await successfulFetch('http://localhost:3000/a/b/api/data?key=testKey');
    const value = await response.buffer();

    expect(value).toEqual(Buffer.from('hello'));

    await cleanup();
  });
});
