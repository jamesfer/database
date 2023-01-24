import { RequestRouter } from './types/request-router';
import { switchRouter } from './utils/switch-router';
import { ProcessManager } from '../core/process-manager';
import { uniqueId } from 'lodash';
import { BaseRequest } from './requests/base-request';
import { RequestCategory } from './types/request-category';
import { assertNever } from '../utils/assert-never';
import { HashPartitionProcess } from '../components/hash-partition/hash-partition-process';
import { FullyQualifiedPath } from '../config/config';
import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequest } from './unified-request-router';
import {
  SimpleInMemoryKeyValueProcess
} from '../components/simple-memory-key-value-datastore/simple-in-memory-key-value-process';

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
  rpcInterface: RpcInterface<AnyRequest>,
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
        processManager.register(processId, new SimpleInMemoryKeyValueProcess());
        break;

      case 'HashPartition':
        processManager.register(processId, new HashPartitionProcess(
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
