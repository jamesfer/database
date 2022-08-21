import { RequestRouter } from '../../core/routers/scaffolding/request-router';
import { switchRouter } from '../../core/routers/scaffolding/switch-router';
import { KeyValueProcessAction, KeyValueProcessRequest } from '../../core/routers/key-value-node-request';
import { SimpleMemoryKeyValueDatastoreProcess } from './simple-memory-key-value-datastore-process';

export const simpleMemoryKeyValueProcessRouter = (
  process: SimpleMemoryKeyValueDatastoreProcess,
): RequestRouter<KeyValueProcessRequest> => switchRouter('action')<KeyValueProcessRequest>({
  async [KeyValueProcessAction.Get](request) {
    return process.get(request.key);
  },
  async [KeyValueProcessAction.Put](request) {
    await process.put(request.key, request.value);
  },
  async [KeyValueProcessAction.Drop](request) {
    await process.drop(request.key);
  }
})
