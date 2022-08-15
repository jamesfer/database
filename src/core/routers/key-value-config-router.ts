import { ConfigEntryName } from '../../types/config';
import { PathRequestTarget, RequestType } from './scaffolding/request';
import { RequestRouter } from './scaffolding/request-router';
import { RPCInterface } from '../../types/rpc-interface';
import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from './key-value-process-router';
import { assertNever } from '../../utils/assert-never';
import { AllRouterCategories } from './all-router-categories';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { AnyRequest } from './all-router';

export enum KeyValueConfigAction {
  Get,
  Put,
  Drop,
}

interface RequestBase<A extends KeyValueConfigAction> {
  target: PathRequestTarget;
  category: AllRouterCategories.KeyValueConfig;
  action: A;
}

export interface KeyValueConfigGetRequest extends RequestBase<KeyValueConfigAction.Get> {
  key: string;
}

export interface KeyValueConfigPutRequest extends RequestBase<KeyValueConfigAction.Put> {
  key: string;
  value: ArrayBuffer;
}

export interface KeyValueConfigDropRequest extends RequestBase<KeyValueConfigAction.Drop> {
  key: string;
}

export type KeyValueConfigRequest =
  | KeyValueConfigGetRequest
  | KeyValueConfigPutRequest
  | KeyValueConfigDropRequest;

export const keyValueConfigRouter = (
  metadataDispatcher: MetadataDispatcherFacade,
  rpcInterface: RPCInterface<AnyRequest>,
): RequestRouter<KeyValueConfigRequest> => async (request) => {
  switch (request.action) {
    case KeyValueConfigAction.Get: {
      const internalConfigPath = [...request.target.path, 'internal'];
      const config = await metadataDispatcher.getEntryAs(internalConfigPath, ConfigEntryName.SimpleMemoryKeyValueInternal);
      if (!config.remoteProcess) {
        throw new Error('KeyValueDatastore internal config is not ready yet');
      }

      const processRequest: KeyValueProcessGetRequest = {
        target: {
          type: RequestType.Node,
          nodeId: config.remoteProcess.nodeId,
        },
        category: AllRouterCategories.KeyValueProcess,
        processId: config.remoteProcess.processId,
        action: KeyValueProcessAction.Get,
        key: request.key,
      };
      return rpcInterface.makeRequest(processRequest);
    }

    case KeyValueConfigAction.Put: {
      const internalConfigPath = [...request.target.path, 'internal'];
      const config = await metadataDispatcher.getEntryAs(internalConfigPath, ConfigEntryName.SimpleMemoryKeyValueInternal);
      if (!config.remoteProcess) {
        throw new Error('KeyValueDatastore internal config is not ready yet');
      }

      const processRequest: KeyValueProcessPutRequest = {
        target: {
          type: RequestType.Node,
          nodeId: config.remoteProcess.nodeId,
        },
        category: AllRouterCategories.KeyValueProcess,
        processId: config.remoteProcess.processId,
        action: KeyValueProcessAction.Put,
        key: request.key,
        value: request.value,
      };
      await rpcInterface.makeRequest(processRequest);
      break;
    }

    case KeyValueConfigAction.Drop: {
      const internalConfigPath = [...request.target.path, 'internal'];
      const config = await metadataDispatcher.getEntryAs(internalConfigPath, ConfigEntryName.SimpleMemoryKeyValueInternal);
      if (!config.remoteProcess) {
        throw new Error('KeyValueDatastore internal config is not ready yet');
      }

      const processRequest: KeyValueProcessDropRequest = {
        target: {
          type: RequestType.Node,
          nodeId: config.remoteProcess.nodeId,
        },
        category: AllRouterCategories.KeyValueProcess,
        processId: config.remoteProcess.processId,
        action: KeyValueProcessAction.Drop,
        key: request.key,
      };
      await rpcInterface.makeRequest(processRequest);
      break;
    }

    default:
      assertNever(request);
  }
}

// export class KeyValueProcessApi {
//   public constructor(
//     private readonly nodeId: string,
//     private readonly processManager: ProcessManager,
//   ) {}
//
//   async put(processId: string, key: string, value: ArrayBuffer): Promise<void> {
//     await this.getProcess(processId).put(key, value);
//   }
//
//   async get(processId: string, key: string): Promise<ArrayBuffer | undefined> {
//     return this.getProcess(processId).get(key);
//   }
//
//   async drop(processId: string, key: string): Promise<void> {
//     await this.getProcess(processId).drop(key);
//   }
//
//   private getProcess(processId: string): KeyValueDatastore {
//     const process = this.processManager.getProcessByIdAs(processId, KEY_VALUE_DATASTORE_FLAG);
//     if (!process) {
//       throw new Error(`KeyValue compatible process does not exist on this node. Node id: ${this.nodeId}, process id: ${processId}`);
//     }
//     return process;
//   }
// }
//
//
