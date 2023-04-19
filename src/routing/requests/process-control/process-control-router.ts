import { RequestRouter } from '../../types/request-router';
import { switchRouter } from '../../utils/switch-router';
import { ProcessManager } from '../../../core/process-manager';
import { uniqueId } from 'lodash';
import { assertNever } from '../../../utils/assert-never';
import { HashPartitionProcess } from '../../../components/hash-partition/process/hash-partition-process';
import { RpcInterface } from '../../../rpc/rpc-interface';
import {
  SimpleInMemoryKeyValueProcess
} from '../../../components/simple-memory-key-value-datastore/simple-in-memory-key-value-process';
import { AnyRequest } from '../any-request';
import { ProcessControlRequest, ProcessControlRequestAction } from './process-control-request';
import {
  TransformationRunnerProcess
} from '../../../components/transformation-runner/process/transformation-runner-process';
import {
  JsonLinesRowBlockProcess
} from '../../../components/json-lines-row-block/process/json-lines-row-block-process';
import { AnyResponse } from '../any-response';

export const processControlRouter = (
  nodeId: string,
  rpcInterface: RpcInterface<AnyRequest>,
  processManager: ProcessManager,
): RequestRouter<ProcessControlRequest, AnyResponse> => switchRouter('action')<ProcessControlRequest, AnyResponse>({
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

      case 'TransformationRunner':
        processManager.register(processId, new TransformationRunnerProcess());
        break;

      case 'JsonLinesRowBlock':
        processManager.register(processId, new JsonLinesRowBlockProcess(processId));
        break;

      default:
        assertNever(request.payload);
    }
    return processId
  }
});
