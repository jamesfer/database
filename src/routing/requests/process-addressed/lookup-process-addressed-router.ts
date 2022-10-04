import { RpcInterface } from '../../../rpc/rpc-interface';
import { AnyRequest } from '../../all-request-router';
import { RequestRouter } from '../../types/request-router';
import { Refine } from '../../../types/refine';
import { ProcessAddressedRequest } from './process-addressed-request';
import { Process } from '../../../processes/process';
import { ProcessType } from '../../../processes/process-type';
import { ProcessAddressedGroupName } from './base-process-addressed-request';
import { hashPartitionProcessRouter } from '../../../components/hash-partition/hash-partition-process-router';
import {
  simpleMemoryKeyValueProcessRouter
} from '../../../components/simple-memory-key-value-datastore/simple-memory-key-value-process-router';

type ProcessAddressedRouter<P extends Process, R extends ProcessAddressedRequest> = (process: P) => RequestRouter<R>;

type RequestGroupLookup<P extends Process> = {
  [G in ProcessAddressedRequest['group']]?: ProcessAddressedRouter<P, Refine<ProcessAddressedRequest, { group: G }>>
};

type ProcessAddressedRouterMap = {
  [P in Process['type']]?: RequestGroupLookup<Refine<Process, { type: P }>>
};

function createRouterLookup(
  rpcInterface: RpcInterface<AnyRequest>,
): ProcessAddressedRouterMap {
  return {
    [ProcessType.HashPartition]: {
      [ProcessAddressedGroupName.KeyValue]: hashPartitionProcessRouter(rpcInterface),
    },
    [ProcessType.SimpleMemoryKeyValue]: {
      [ProcessAddressedGroupName.KeyValue]: simpleMemoryKeyValueProcessRouter,
    },
  };
}

export const lookupProcessAddressedRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
): <P extends Process, R extends ProcessAddressedRequest>(
  requestGroup: R['group'],
  processType: P['type'],
) => ProcessAddressedRouter<P, R> | undefined => {
  const lookup = createRouterLookup(rpcInterface);

  return <P extends Process, R extends ProcessAddressedRequest>(
    requestGroup: R['group'],
    processType: P['type'],
  ) => {
    return lookup[processType]?.[requestGroup] as ProcessAddressedRouter<P, R> | undefined;
  };
};
