import { switchRouter } from '../../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessAddressedRequest } from '../../../routing/actions/process-addressed/key-value-process-addressed-request';
import { HashPartitionProcess } from './hash-partition-process';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { ConfigAddressedGroupName } from '../../../routing/actions/config-addressed/base-config-addressed-request';
import { RequestCategory } from '../../../routing/actions/request-category';
import { RequestRouter } from '../../../routing/types/request-router';
import { AnyRequestResponse } from '../../../routing/actions/any-request-response';
import { AnyResponse } from '../../../routing/actions/any-response';
import { KeyValueConfigGetRequest } from '../../../routing/actions/config-addressed/key-value/get';
import { KeyValueConfigPutRequest } from '../../../routing/actions/config-addressed/key-value/put';
import { KeyValueConfigDropRequest } from '../../../routing/actions/config-addressed/key-value/drop';
import {
  KeyValueConfigAddressedRequestActionType
} from '../../../routing/actions/config-addressed/key-value/base-request';

export const hashPartitionProcessRouter = (
  rpcInterface: RpcInterface<AnyRequestResponse>,
) => (
  process: HashPartitionProcess,
): RequestRouter<KeyValueProcessAddressedRequest, AnyResponse> => switchRouter('action')<KeyValueProcessAddressedRequest, AnyResponse>({
  async [KeyValueProcessAction.Get](request) {
    // Forward the request to the matching nested config implementation
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigGetRequest = {
      category: RequestCategory.Config,
      group: ConfigAddressedGroupName.KeyValue,
      action: KeyValueConfigAddressedRequestActionType.Get,
      target: nestedConfigPath,
      key: request.key,
    }
    return rpcInterface.makeRequest(forwardedRequest)
  },
  async [KeyValueProcessAction.Put](request) {
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigPutRequest = {
      category: RequestCategory.Config,
      group: ConfigAddressedGroupName.KeyValue,
      action: KeyValueConfigAddressedRequestActionType.Put,
      target: nestedConfigPath,
      key: request.key,
      value: request.value,
    }
    return rpcInterface.makeRequest(forwardedRequest);
  },
  async [KeyValueProcessAction.Drop](request) {
    const nestedConfigPath = [...process.parentPath, 'internal', `nested${process.partitionIndex}`];
    const forwardedRequest: KeyValueConfigDropRequest = {
      category: RequestCategory.Config,
      group: ConfigAddressedGroupName.KeyValue,
      action: KeyValueConfigAddressedRequestActionType.Drop,
      target: nestedConfigPath,
      key: request.key,
    }
    return rpcInterface.makeRequest(forwardedRequest);
  }
})
