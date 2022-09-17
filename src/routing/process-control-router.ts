import { RequestRouter } from './types/request-router';
import { switchRouter } from './utils/switch-router';
import { ProcessManager } from '../core/process-manager';
import { uniqueId } from 'lodash';
import {
  SimpleMemoryKeyValueDatastoreProcess
} from '../components/simple-memory-key-value-datastore/simple-memory-key-value-datastore-process';
import { BaseRequest } from './requests/base-request';
import { RequestCategory } from './types/request-category';
import { assertNever } from '../utils/assert-never';
import { HashPartitionProcess } from '../components/hash-partition/hash-partition-process';
import { FullyQualifiedPath } from '../config/config';
import { RPCInterface } from '../types/rpc-interface';
import { AnyRequest } from './all-request-router';

export enum ProcessControlRequestAction {
  Spawn = 'Spawn',
}

// TODO find a better way to handle this
export interface SpawnSimpleMemoryKeyValueProcess {
  processClass: 'SimpleMemoryKeyValueDatastore';
}

export interface SpawnHashPartitionProcess {
  processClass: 'HashPartition';
  parentPath: FullyQualifiedPath;
  partitionIndex: number;
}

export type SpawnProcessPayload =
  | SpawnSimpleMemoryKeyValueProcess
  | SpawnHashPartitionProcess;

export interface SpawnProcessRequest extends BaseRequest {
  category: RequestCategory.ProcessControl;
  action: ProcessControlRequestAction.Spawn;
  payload: SpawnProcessPayload;
  targetNodeId: string;
}

export type ProcessControlRequest = SpawnProcessRequest;

export const processControlRouter = (
  nodeId: string,
  rpcInterface: RPCInterface<AnyRequest>,
  processManager: ProcessManager,
): RequestRouter<ProcessControlRequest> => switchRouter('action')<ProcessControlRequest>({
  async [ProcessControlRequestAction.Spawn](request) {
    // Assert that this is the correct node
    if (request.targetNodeId !== nodeId) {
      throw new Error(`Request arrived at the wrong node. Current node: ${nodeId}, expected node: ${request.targetNodeId}`);
    }

    const processId = uniqueId(request.payload.processClass)
    switch (request.payload.processClass) {
      case 'SimpleMemoryKeyValueDatastore':
        processManager.register(processId, await SimpleMemoryKeyValueDatastoreProcess.initialize());
        break;

      case 'HashPartition':
        processManager.register(processId, await HashPartitionProcess.initialize(
          rpcInterface,
          request.payload.parentPath,
          request.payload.partitionIndex,
        ));
        break;

      default:
        assertNever(request.payload);
    }
    return processId
  }
});
