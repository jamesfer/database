import { RpcInterface } from '../../../rpc/rpc-interface';
import { RequestRouter } from '../../types/request-router';
import { Refine } from '../../../types/refine';
import { ProcessAddressedRequest } from './process-addressed-request';
import { Process } from '../../../processes/process';
import { ProcessType } from '../../../processes/process-type';
import { ProcessAddressedGroupName } from './base-process-addressed-request';
import { hashPartitionProcessRouter } from '../../../components/hash-partition/process/hash-partition-process-router';
import {
  simpleInMemoryKeyValueProcessRouter
} from '../../../components/simple-memory-key-value-datastore/simple-in-memory-key-value-process-router';
import {
  transformationRunnerProcessRequestRouter
} from '../../../components/transformation-runner/process/transformation-runner-process-request-router';
import { AnyRequest } from '../any-request';

type ProcessAddressedRouter<P extends Process, R extends ProcessAddressedRequest> = (process: P) => RequestRouter<R>;

type RequestGroupLookup<P extends Process> = {
  [G in ProcessAddressedRequest['group']]?: ProcessAddressedRouter<P, Refine<ProcessAddressedRequest, { group: G }>>
};

type ProcessAddressedRouterMap = {
  [P in Process['type']]?: RequestGroupLookup<Refine<Process, { type: P }>>
};

/**
 * This still exists because processes don't have the same type infrastructure
 * available as configs. Eventually they should, but for now, we have to manually
 * create this lookup table to find the correct router for each process type.
 */
function createRouterLookup(
  rpcInterface: RpcInterface<AnyRequest>,
): ProcessAddressedRouterMap {
  return {
    [ProcessType.HashPartition]: {
      [ProcessAddressedGroupName.KeyValue]: hashPartitionProcessRouter(rpcInterface),
    },
    [ProcessType.SimpleMemoryKeyValue]: {
      [ProcessAddressedGroupName.KeyValue]: simpleInMemoryKeyValueProcessRouter,
    },
    [ProcessType.TransformationRunner]: {
      [ProcessAddressedGroupName.TransformationRunner]: transformationRunnerProcessRequestRouter(rpcInterface),
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
