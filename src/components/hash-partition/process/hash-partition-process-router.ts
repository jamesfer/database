import { switchRouter } from '../../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessAddressedRequest } from '../../../routing/requests/process-addressed/key-value-process-addressed-request';
import { HashPartitionProcess } from './hash-partition-process';
import { RpcInterface } from '../../../rpc/rpc-interface';
import {
  KeyValueConfigAddressedRequestAction, KeyValueConfigDropRequest,
  KeyValueConfigGetRequest,
  KeyValueConfigPutRequest
} from '../../../routing/requests/config-addressed/key-value-config-addressed-request';
import { ConfigAddressedGroupName } from '../../../routing/requests/config-addressed/base-config-addressed-request';
import { RequestCategory } from '../../../routing/types/request-category';
import { RequestRouter } from '../../../routing/types/request-router';
import { AnyRequest } from '../../../routing/requests/any-request';
import { AnyResponse } from '../../../routing/requests/any-response';

export const hashPartitionProcessRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
) => (
  process: HashPartitionProcess,
): RequestRouter<KeyValueProcessAddressedRequest, AnyResponse> => switchRouter('action')<KeyValueProcessAddressedRequest, AnyResponse>({
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
