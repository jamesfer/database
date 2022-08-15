import { ProcessManager } from '../process-manager';
import { KEY_VALUE_DATASTORE_FLAG, KeyValueDatastore } from '../../facades/key-value-datastore';
import { RequestRouter } from './scaffolding/request-router';
import { AllRouterCategories } from './all-router-categories';
import { NodeRequestTarget } from './scaffolding/request';
import { switchRouter } from './scaffolding/switch-router';

export enum KeyValueProcessAction {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

interface RequestBase<A extends KeyValueProcessAction> {
  target: NodeRequestTarget;
  category: AllRouterCategories.KeyValueProcess;
  action: A;
  processId: string;
}

export interface KeyValueProcessGetRequest extends RequestBase<KeyValueProcessAction.Get> {
  key: string;
}

export interface KeyValueProcessPutRequest extends RequestBase<KeyValueProcessAction.Put> {
  key: string;
  value: ArrayBuffer;
}

export interface KeyValueProcessDropRequest extends RequestBase<KeyValueProcessAction.Drop> {
  key: string;
}

export type KeyValueProcessRequest =
  | KeyValueProcessGetRequest
  | KeyValueProcessPutRequest
  | KeyValueProcessDropRequest;

function assertNodeIdIsCorrect(actualNodeId: string, requestNodeId: string): void {
  if (actualNodeId !== requestNodeId) {
    throw new Error(`Process request was sent to the wrong node. Actual node id: ${actualNodeId}, requested node id: ${requestNodeId}`);
  }
}

function getProcess(nodeId: string, processManager: ProcessManager, processId: string): KeyValueDatastore {
  const process = processManager.getProcessByIdAs(processId, KEY_VALUE_DATASTORE_FLAG);
  if (!process) {
    throw new Error(`KeyValue compatible process does not exist on this node. Node id: ${nodeId}, process id: ${processId}`);
  }
  return process;
}

export const keyValueProcessRouter = (
  nodeId: string,
  processManager: ProcessManager,
): RequestRouter<KeyValueProcessRequest> => switchRouter('action')<KeyValueProcessRequest>({
  async [KeyValueProcessAction.Get](request) {
    assertNodeIdIsCorrect(nodeId, request.target.nodeId);
    return getProcess(nodeId, processManager, request.processId).get(request.key);
  },
  async [KeyValueProcessAction.Put](request) {
    assertNodeIdIsCorrect(nodeId, request.target.nodeId);
    await getProcess(nodeId, processManager, request.processId).put(request.key, request.value);
  },
  async [KeyValueProcessAction.Drop](request) {
    assertNodeIdIsCorrect(nodeId, request.target.nodeId);
    await getProcess(nodeId, processManager, request.processId).drop(request.key);
  }
})
