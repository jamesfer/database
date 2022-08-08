import { of, Subject } from 'rxjs';
import { SimpleMemoryKeyValueDatastore } from './simple-memory-key-value-datastore';
import { SimpleMemoryKeyValueEntry } from '../../types/config';

describe('SimpleMemoryKeyValueDatastore', () => {
  it('initialize creates a datastore', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key');
    expect(datastore).toBeInstanceOf(SimpleMemoryKeyValueDatastore);
  });

  it('throws an error when getting a key that does not exist', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key');
    await expect(datastore.get('a')).rejects
      .toThrow(`Could not get key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
  });

  it('stores data', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key')
    await datastore.put('a', Buffer.from('hello'));
    expect(await datastore.get('a'))
  });

  it('deletes data', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key')
    await datastore.put('a', Buffer.from('hello'));
    await datastore.drop('a');
    await expect(datastore.get('a')).rejects
      .toThrow(`Could not get key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
  });

  it('throws an error when deleting a key that does not exist', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key')
    await expect(datastore.drop('a')).rejects
      .toThrow(`Could not delete key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
  });
});
