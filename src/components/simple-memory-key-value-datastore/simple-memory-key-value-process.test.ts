import { SimpleMemoryKeyValueProcess } from './simple-memory-key-value-process';

describe('SimpleMemoryKeyValueDatastore', () => {
  it('throws an error when getting a key that does not exist', async () => {
    const datastore = new SimpleMemoryKeyValueProcess();
    await expect(datastore.get('a')).rejects
      .toThrow(`Could not get key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
  });

  it('stores data', async () => {
    const datastore = new SimpleMemoryKeyValueProcess();
    await datastore.put('a', 'hello');
    expect(await datastore.get('a'))
  });

  it('deletes data', async () => {
    const datastore = new SimpleMemoryKeyValueProcess();
    await datastore.put('a', 'hello');
    await datastore.drop('a');
    await expect(datastore.get('a')).rejects
      .toThrow(`Could not get key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
  });

  it('throws an error when deleting a key that does not exist', async () => {
    const datastore = new SimpleMemoryKeyValueProcess();
    await expect(datastore.drop('a')).rejects
      .toThrow(`Could not delete key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
  });
});
