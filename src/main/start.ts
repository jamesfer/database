import { ProcessManager } from '../core/process-manager';
import { ClusterNode, Options } from './options';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { unifiedRequestRouter, AnyRequest } from '../routing/unified-request-router';
import { ConfigEntry } from '../config/config-entry';
import { NaiveRPCCommitLogFactory } from '../core/commit-log/naive-rpc-commit-log-factory';
import { ConfigEntryCodec } from '../core/commit-log/config-entry-codec';
import { HttpRpcClient, HttpUrlResolver, LOCAL } from '../rpc/http-rpc-client';
import { NaiveRpcCommitLogRequestCodec } from '../core/commit-log/naive-rpc-commit-log-request-codec';
import { RequestCategory } from '../routing/types/request-category';
import { StaticMembershipList } from '../membership/membership-list';
import { keyBy } from 'lodash';
import { RpcClientWrapper } from '../rpc/rpc-client-wrapper';
import { RequestRouter } from '../routing/types/request-router';
import { RpcClientFactoryInterface } from '../core/commit-log/rpc-client-factory-interface';
import { NaiveRpcCommitLogRequest } from '../core/commit-log/naive-rpc-commit-log-request';
import { RpcInterface } from '../rpc/rpc-interface';
import { Unsubscribable } from 'rxjs';
import { AnyRequestCodec } from '../routing/any-request-codec';

function makeMetadataHttpHostResolver<T>(
  thisNodeId: string,
  clusterNodes: { [k: string]: ClusterNode },
): HttpUrlResolver<NaiveRpcCommitLogRequest<T>> {
  return (request) => {
    if (request.nodeId === thisNodeId) {
      return LOCAL;
    }

    const targetNode = clusterNodes[request.nodeId];
    return `http://${targetNode.host}:${targetNode.metadataRpcPort}`;
  };
}

async function makeNaiveDistributedMetadataFactory(
  thisNode: ClusterNode,
  leaderNode: ClusterNode,
  clusterNodes: { [k: string]: ClusterNode },
) {
  const codec = new NaiveRpcCommitLogRequestCodec<ConfigEntry>(new ConfigEntryCodec());
  const naiveRpcCommitLogRpcFactory = new class implements RpcClientFactoryInterface<NaiveRpcCommitLogRequest<ConfigEntry>> {
    createRpcClient(router: RequestRouter<NaiveRpcCommitLogRequest<ConfigEntry>>): Promise<RpcInterface<NaiveRpcCommitLogRequest<ConfigEntry>> & Unsubscribable> {
      return HttpRpcClient.initialize(
        codec,
        codec,
        thisNode.metadataRpcPort,
        makeMetadataHttpHostResolver(thisNode.nodeId, clusterNodes),
        router,
      );
    }
  };
  return new NaiveRPCCommitLogFactory<ConfigEntry>(
    naiveRpcCommitLogRpcFactory,
    thisNode.nodeId,
    leaderNode.nodeId,
    Object.keys(clusterNodes),
  );
}

function makeGeneralHttpHostResolver(
  nodeId: string,
  leaderId: string,
  clusterNodes: { [k: string]: ClusterNode },
): HttpUrlResolver<AnyRequest> {
  return (request) => {
    const targetNodeId = request.category === RequestCategory.ConfigAction ? leaderId : request.targetNodeId;
    if (targetNodeId === nodeId) {
      return LOCAL;
    }

    const targetNode = clusterNodes[targetNodeId];
    return `http://${targetNode.host}:${targetNode.generalRpcPort}`;
  };
}

async function makeGeneralHttpRpcInterface(
  nodeId: string,
  leaderId: string,
  clusterNodes: { [k: string]: ClusterNode },
  router: RequestRouter<AnyRequest>,
): Promise<HttpRpcClient<AnyRequest, AnyRequest>> {
  const requestCodec = new AnyRequestCodec();
  return HttpRpcClient.initialize<AnyRequest, AnyRequest>(
    requestCodec,
    requestCodec,
    clusterNodes[nodeId].generalRpcPort,
    makeGeneralHttpHostResolver(nodeId, leaderId, clusterNodes),
    router,
  );
}

export async function start(options: Options): Promise<() => Promise<void>> {
  const nodes = keyBy(options.clusterNodes, 'nodeId');
  const nodeIds = Object.keys(nodes);

  // Core managers
  const processManager = await ProcessManager.initialize();
  const metadataManager = await MetadataManager.initialize();

  // Foundational components
  const membershipList = await StaticMembershipList.initialize(nodeIds);
  const distributedCommitLogFactory = await makeNaiveDistributedMetadataFactory(
    nodes[options.nodeId],
    nodes[options.leaderId],
    nodes,
  );

  // Apis
  const rpcClientWrapper = new RpcClientWrapper<AnyRequest>();
  const router = unifiedRequestRouter(
    options.nodeId,
    rpcClientWrapper,
    processManager,
    metadataManager,
    distributedCommitLogFactory,
    membershipList.nodes$,
  );
  const httpRpcClient = await makeGeneralHttpRpcInterface(
    options.nodeId,
    options.leaderId,
    nodes,
    router,
  );
  rpcClientWrapper.registerClient(httpRpcClient);

  // Clean up all resources
  return async () => {
    httpRpcClient.unsubscribe();
    distributedCommitLogFactory.unsubscribe();
  };
}
