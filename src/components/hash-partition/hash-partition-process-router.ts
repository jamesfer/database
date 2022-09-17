import { KeyValueProcessRouter } from '../../facades/key-value-process-router';
import { switchRouter } from '../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessRequest } from '../../routing/requests/key-value-node-request';
import { HashPartitionProcess } from './hash-partition-process';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import {
  KeyValueConfigAction, KeyValueConfigDropRequest,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../../routing/requests/key-value-config-request';
import { ConfigActionGroupName } from '../../routing/requests/base-config-action-request';
import { RequestCategory } from '../../routing/types/request-category';

export const hashPartitionProcessRouter = (
  rpcInterface: RPCInterface<AnyRequest>,
  process: HashPartitionProcess,
): KeyValueProcessRouter => switchRouter('action')<KeyValueProcessRequest>({
  async [KeyValueProcessAction.Get](request) {
    // Forward the request to the matching nested config implementation
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigGetRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigActionGroupName.KeyValue,
      action: KeyValueConfigAction.Get,
      target: nestedConfigPath,
      key: request.key,
    }
    return rpcInterface.makeRequest(forwardedRequest)
  },
  async [KeyValueProcessAction.Put](request) {
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigPutRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigActionGroupName.KeyValue,
      action: KeyValueConfigAction.Put,
      target: nestedConfigPath,
      key: request.key,
      value: request.value,
    }
    return rpcInterface.makeRequest(forwardedRequest);
  },
  async [KeyValueProcessAction.Drop](request) {
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigDropRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigActionGroupName.KeyValue,
      action: KeyValueConfigAction.Drop,
      target: nestedConfigPath,
      key: request.key,
    }
    return rpcInterface.makeRequest(forwardedRequest);
  }
})
