import { BaseConfigActionRequest, ConfigActionGroupName } from './scaffolding/base-config-action-request';

export enum KeyValueConfigAction {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

interface RequestBase<A extends KeyValueConfigAction> extends BaseConfigActionRequest {
  group: ConfigActionGroupName.KeyValue;
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

// export const keyValueConfigRouter = (
//   metadataDispatcher: MetadataDispatcherFacade,
//   rpcInterface: RPCInterface<AnyRequest>,
// ): RequestRouter<KeyValueConfigRequest> => async (request) => {
//   const internalConfigPath = [...request.target.path, 'internal'];
//   const config = await metadataDispatcher.getEntry(internalConfigPath);
//   if (!config) {
//     throw new Error(`Config does not exist at path: ${config}`);
//   }
//
//   const keyValueController = castConfigAsFacade(config, KEY_VALUE_CONTROLLER_FLAG);
//   if (!keyValueController) {
//     throw new Error(`Config cannot handle key value requests. Config name: ${config.name}`);
//   }
//
//   switch (request.action) {
//     case KeyValueConfigAction.Get: {
//       const processRequest: KeyValueProcessGetRequest = {
//         target: {
//           type: RequestType.Node,
//           nodeId: config.remoteProcess.nodeId,
//         },
//         category: RequestCategory.KeyValueProcess,
//         processId: config.remoteProcess.processId,
//         action: KeyValueProcessAction.Get,
//         key: request.key,
//       };
//       return rpcInterface.makeRequest(processRequest);
//     }
//
//     case KeyValueConfigAction.Put: {
//       const processRequest: KeyValueProcessPutRequest = {
//         target: {
//           type: RequestType.Node,
//           nodeId: config.remoteProcess.nodeId,
//         },
//         category: RequestCategory.KeyValueProcess,
//         processId: config.remoteProcess.processId,
//         action: KeyValueProcessAction.Put,
//         key: request.key,
//         value: request.value,
//       };
//       await rpcInterface.makeRequest(processRequest);
//       break;
//     }
//
//     case KeyValueConfigAction.Drop: {
//       const processRequest: KeyValueProcessDropRequest = {
//         target: {
//           type: RequestType.Node,
//           nodeId: config.remoteProcess.nodeId,
//         },
//         category: RequestCategory.KeyValueProcess,
//         processId: config.remoteProcess.processId,
//         action: KeyValueProcessAction.Drop,
//         key: request.key,
//       };
//       await rpcInterface.makeRequest(processRequest);
//       break;
//     }
//
//     default:
//       assertNever(request);
//   }
// }
