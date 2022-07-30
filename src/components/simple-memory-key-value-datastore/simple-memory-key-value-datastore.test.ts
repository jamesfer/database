import { of, Subject } from 'rxjs';
import { SimpleMemoryKeyValueDatastore } from './simple-memory-key-value-datastore';
import { SimpleMemoryKeyValueEntry } from '../../types/config';

describe('SimpleMemoryKeyValueDatastore', () => {
  let configSubject$: Subject<SimpleMemoryKeyValueEntry>;

  beforeEach(() => {
    configSubject$ = new Subject();
  });

  it('initialize creates a datastore', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key', configSubject$);
    expect(datastore).toBeInstanceOf(SimpleMemoryKeyValueDatastore);
    await datastore.cleanup();
  });

  it('throws an error when getting a key that does not exist', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key', of())
    await expect(datastore.get('a')).rejects
      .toThrow(`Could not get key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
    await datastore.cleanup();
  });

  it('stores data', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key', of())
    await datastore.put('a', Buffer.from('hello'));
    expect(await datastore.get('a'))
    await datastore.cleanup();
  });

  it('deletes data', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key', of())
    await datastore.put('a', Buffer.from('hello'));
    await datastore.drop('a');
    await expect(datastore.get('a')).rejects
      .toThrow(`Could not get key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
    await datastore.cleanup();
  });

  it('throws an error when deleting a key that does not exist', async () => {
    const datastore = await SimpleMemoryKeyValueDatastore.initialize('key', of())
    await expect(datastore.drop('a')).rejects
      .toThrow(`Could not delete key "a" from SimpleMemoryKeyValueDatastore because it didn't exist`);
    await datastore.cleanup();
  });
});
