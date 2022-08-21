import { RequestRouter } from './scaffolding/request-router';
import { switchRouter } from './scaffolding/switch-router';
import { ProcessManager } from '../process-manager';
import { uniqueId } from 'lodash';
import {
  SimpleMemoryKeyValueDatastoreProcess
} from '../../components/simple-memory-key-value-datastore/simple-memory-key-value-datastore-process';
import { BaseRequest } from './scaffolding/base-request';
import { RequestCategory } from './scaffolding/request-category';

export enum ProcessControlRequestAction {
  Spawn = 'Spawn',
}

// TODO find a better way to handle this
export interface SpawnSimpleMemoryKeyValueProcess {
  processClass: 'SimpleMemoryKeyValueDatastore';
}

export type SpawnProcessPayload = SpawnSimpleMemoryKeyValueProcess;

export interface SpawnProcessRequest extends BaseRequest {
  category: RequestCategory.ProcessControl;
  action: ProcessControlRequestAction.Spawn;
  payload: SpawnProcessPayload;
  targetNodeId: string;
}

export type ProcessControlRequest = SpawnProcessRequest;

export const processControlRouter = (
  nodeId: string,
  processManager: ProcessManager,
): RequestRouter<ProcessControlRequest> => switchRouter('action')<ProcessControlRequest>({
  async [ProcessControlRequestAction.Spawn](request) {
    // Assert that this is the correct node
    if (request.targetNodeId !== nodeId) {
      throw new Error(`Request arrived at the wrong node. Current node: ${nodeId}, expected node: ${request.targetNodeId}`);
    }

    switch (request.payload.processClass) {
      case 'SimpleMemoryKeyValueDatastore':
        const processId = uniqueId('SimpleMemoryKeyValueDatastoreInstance');
        processManager.register(processId, await SimpleMemoryKeyValueDatastoreProcess.initialize());
        return processId;

      default:
        throw new Error(`Unknown spawn process class: ${request.payload.processClass}`);
    }
  }
});
