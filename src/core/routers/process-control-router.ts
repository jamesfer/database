import { RequestRouter } from './scaffolding/request-router';
import { AllRouterCategories } from './all-router-categories';
import { NodeRequestTarget } from './scaffolding/request';
import { switchRouter } from './scaffolding/switch-router';
import { ProcessManager } from '../process-manager';
import { uniqueId } from 'lodash';
import {
  SimpleMemoryKeyValueDatastoreProcess
} from '../../components/simple-memory-key-value-datastore/simple-memory-key-value-datastore-process';

export enum ProcessControlRequestAction {
  Spawn = 'Spawn',
}

// TODO find a better way to handle this
export interface SpawnSimpleMemoryKeyValueProcess {
  processClass: 'SimpleMemoryKeyValueDatastore';
}

export type SpawnProcessPayload = SpawnSimpleMemoryKeyValueProcess;

export interface SpawnProcessRequest {
  target: NodeRequestTarget;
  category: AllRouterCategories.ProcessControl;
  action: ProcessControlRequestAction.Spawn;
  payload: SpawnProcessPayload;
}

export type ProcessControlRequest = SpawnProcessRequest;

export const processControlRouter = (
  processManager: ProcessManager,
): RequestRouter<ProcessControlRequest> => switchRouter('action')<ProcessControlRequest>({
  async [ProcessControlRequestAction.Spawn](request) {
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
