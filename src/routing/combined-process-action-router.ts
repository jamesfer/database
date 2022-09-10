import { RequestRouter } from './types/request-router';
import { BaseProcessActionRequest, ProcessActionGroupName } from './requests/base-process-action-request';
import { ProcessManager } from '../core/process-manager';
import { KeyValueProcessRequest } from './requests/key-value-node-request';
import { castFacade } from '../facades/scaffolding/cast-facade';
import { KEY_VALUE_PROCESS_ROUTER_FLAG } from '../facades/key-value-process-router';
import { assertNever } from '../utils/assert-never';

export type ProcessActionRequest =
  | KeyValueProcessRequest

export function combinedProcessActionRouter(
  nodeId: string,
  processManager: ProcessManager,
): RequestRouter<ProcessActionRequest> {
  return async (request) => {
    // Assert that this is the correct node
    if (request.targetNodeId !== nodeId) {
      throw new Error(`Request arrived at the wrong node. Current node: ${nodeId}, expected node: ${request.targetNodeId}`);
    }

    // Look up the process id
    const process = processManager.getProcessById(request.targetProcessId);
    if (!process) {
      throw new Error(`Process does not exist on node. Node id: ${nodeId}, process id: ${request.targetProcessId}`);
    }

    // Cast the process to the correct handler
    switch (request.group) {
      case ProcessActionGroupName.KeyValue: {
        const processRouter = castFacade(process, KEY_VALUE_PROCESS_ROUTER_FLAG);
        if (!processRouter) {
          throw new Error(`Process does not support KeyValue process requests. Process: ${process.constructor.name}`);
        }

        return processRouter(request);
      }

      default:
        // TODO uncomment this once there is more than on type of request
        // assertNever(request);
    }
  };
}
