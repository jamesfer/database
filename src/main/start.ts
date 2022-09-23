import { ProcessManager } from '../core/process-manager';
import { CoreApi } from '../core/api/core-api';
import { Options } from './options';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { BehaviorSubject } from 'rxjs';
import { RpcInterface } from '../types/rpc-interface';
import { allRequestRouter, AnyRequest } from '../routing/all-request-router';
import { ConfigEntry } from '../config/config-entry';
import { NaiveRPCCommitLogFactory } from '../core/commit-log/naive-rpc-commit-log';
import { ConfigEntryCodec } from '../core/commit-log/config-entry-codec';
import { HttpRpcInterface } from '../rpc/http-rpc-interface';
import { NaiveRpcCommitLogRequestCodec } from '../core/commit-log/naive-rpc-commit-log-request-codec';
import { Codec } from '../types/codec';
import { RequestCategory } from '../routing/types/request-category';
import { BidirectionalRpcInterface } from '../types/bidirectional-rpc-interface';
import { concatMap } from 'rxjs/operators';

async function makeNaiveDistributedMetadataFactory(
  nodeId: string,
  leaderId: string,
  clusterNodes: string[],
  httpListenPort: number,
) {
  const codec = new NaiveRpcCommitLogRequestCodec<ConfigEntry>(new ConfigEntryCodec());
  const naiveRPCCommitLogRPCInterface = await HttpRpcInterface.initialize(
    nodeId,
    codec,
    codec,
    httpListenPort,
    () => leaderId,
  );
  return new NaiveRPCCommitLogFactory<ConfigEntry>(
    naiveRPCCommitLogRPCInterface,
    nodeId,
    leaderId,
    clusterNodes,
  );
}

async function makeGeneralHttpRpcInterface(nodeId: string, leaderId: string, httpListenPort: number): Promise<BidirectionalRpcInterface<AnyRequest, AnyRequest>> {
  const requestCodec: Codec<AnyRequest, string> = {
    async serialize(value: AnyRequest): Promise<string> {
      return JSON.stringify(value);
    },
    async deserialize(serialized: string): Promise<AnyRequest | undefined> {
      return JSON.parse(serialized);
    }
  };
  const hostResolver = (request: AnyRequest) => (
    request.category === RequestCategory.ConfigAction ? leaderId : request.targetNodeId
  );
  return HttpRpcInterface.initialize<AnyRequest, AnyRequest>(
    nodeId,
    requestCodec,
    requestCodec,
    httpListenPort,
    hostResolver,
  );
}

export async function start(options: Options): Promise<() => Promise<void>> {
  // Core managers
  const processManager = await ProcessManager.initialize();
  const metadataManager = await MetadataManager.initialize();

  // Foundational components
  const nodes$ = new BehaviorSubject<string[]>(options.clusterNodes);
  const rpcInterface = await makeGeneralHttpRpcInterface(
    options.nodeId,
    options.leaderId,
    3000,
  );
  const distributedCommitLogFactory = await makeNaiveDistributedMetadataFactory(
    options.nodeId,
    options.leaderId,
    options.clusterNodes,
    3001,
  );

  // Apis
  const router = allRequestRouter(
    options.nodeId,
    rpcInterface,
    processManager,
    metadataManager,
    distributedCommitLogFactory,
    nodes$,
  );
  const routerSubscription = rpcInterface.incomingRequests$.pipe(
    concatMap(router),
  ).subscribe();

  // Clean up all resources
  return async () => {
    distributedCommitLogFactory.unsubscribe();
    routerSubscription.unsubscribe();
  };
}
