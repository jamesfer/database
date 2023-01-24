import { switchRouter } from '../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessRequest } from '../../routing/requests/key-value-node-request';
import { HashPartitionProcess } from './hash-partition-process';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/unified-request-router';
import {
  KeyValueConfigAddressedRequestAction, KeyValueConfigDropRequest,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../../routing/requests/key-value-config-addressed-request';
import { ConfigAddressedGroupName } from '../../routing/requests/config-addressed/base-config-addressed-request';
import { RequestCategory } from '../../routing/types/request-category';
import { RequestRouter } from '../../routing/types/request-router';

export const hashPartitionProcessRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
) => (
  process: HashPartitionProcess,
): RequestRouter<KeyValueProcessRequest> => switchRouter('action')<KeyValueProcessRequest>({
  async [KeyValueProcessAction.Get](request) {
    // Forward the request to the matching nested config implementation
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigGetRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.KeyValue,
      action: KeyValueConfigAddressedRequestAction.Get,
      target: nestedConfigPath,
      key: request.key,
    }
    return rpcInterface.makeRequest(forwardedRequest)
  },
  async [KeyValueProcessAction.Put](request) {
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigPutRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.KeyValue,
      action: KeyValueConfigAddressedRequestAction.Put,
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
      group: ConfigAddressedGroupName.KeyValue,
      action: KeyValueConfigAddressedRequestAction.Drop,
      target: nestedConfigPath,
      key: request.key,
    }
    return rpcInterface.makeRequest(forwardedRequest);
  }
})
