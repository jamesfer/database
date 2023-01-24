import { RequestRouter } from '../../types/request-router';
import { ProcessManager } from '../../../core/process-manager';
import { ProcessAddressedRequest } from './process-addressed-request';
import { lookupProcessAddressedRouter } from './lookup-process-addressed-router';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { AnyRequest } from '../../unified-request-router';

export function allProcessAddressedRequestRouter(
  nodeId: string,
  processManager: ProcessManager,
  rpcInterface: RpcInterface<AnyRequest>,
): RequestRouter<ProcessAddressedRequest> {
  const lookupRouter = lookupProcessAddressedRouter(rpcInterface);

  return async (request) => {
    console.log(request);
    // Assert that this is the correct node
    if (request.targetNodeId !== nodeId) {
      throw new Error(`Request arrived at the wrong node. Current node: ${nodeId}, expected node: ${request.targetNodeId}`);
    }

    // Look up the process id
    const process = processManager.getProcessById(request.targetProcessId);
    if (!process) {
      throw new Error(`Process does not exist on node. Node id: ${nodeId}, process id: ${request.targetProcessId}`);
    }

    // Find the matching router instance
    const router = lookupRouter(request.group, process.type);
    if (!router) {
      throw new Error(`Process does not support this request. Process type: ${process.type}, request group: ${request.group}`);
    }

    return router(process)(request);
  };
}
