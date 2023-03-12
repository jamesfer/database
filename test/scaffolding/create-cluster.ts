import { ClusterNode } from '../../src/main/options';
import { start } from '../../src/main/start';
import { keyBy, range } from 'lodash';
import { RequestCategory } from '../../src/routing/types/request-category';
import { MetadataTemporaryAction } from '../../src/routing/requests/metadata-temporary/metadata-temporary-request';
import { assert } from '../../src/utils/assert';
import { makeRequest } from './make-request';

function makeCleanupFunction(nodeCleanupCallbacks: (() => Promise<void>)[]): () => Promise<void> {
  return async () => {
    await Promise.all(nodeCleanupCallbacks.map(callback => callback()));
  };
}

export async function createCluster(count: 1, portOffset: number): Promise<[{ node0: ClusterNode }, () => Promise<void>]>;
export async function createCluster(count: 2, portOffset: number): Promise<[{ node0: ClusterNode, node1: ClusterNode }, () => Promise<void>]>;
export async function createCluster(count: 3, portOffset: number): Promise<[{ node0: ClusterNode, node1: ClusterNode, node2: ClusterNode }, () => Promise<void>]>;
export async function createCluster(count: number, portOffset: number): Promise<[{ [k: string]: ClusterNode }, () => Promise<void>]>;
export async function createCluster(count: number, portOffset: number): Promise<[{ [k: string]: ClusterNode }, () => Promise<void>]> {
  assert(count > 0, 'Node count must be greater than 0');

  // Create node definitions
  const nodes: ClusterNode[] = range(count).map(index => ({
    nodeId: `node${index}`,
    host: 'localhost',
    generalRpcPort: 10000 + portOffset + 2 * index,
    metadataRpcPort: 10000 + portOffset + 2 * index + 1,
  }));

  // Start each of the nodes
  const nodeCleanupCallbacks = await Promise.all(nodes.map(node => start({
    nodeId: node.nodeId,
    leaderId: nodes[0].nodeId,
    clusterNodes: nodes,
  })));

  // Bootstrap each of the nodes
  await Promise.all(nodes.map(node => makeRequest(node, {
    category: RequestCategory.MetadataTemporary,
    action: MetadataTemporaryAction.Bootstrap,
    path: [],
  })));

  return [
    keyBy(nodes, 'nodeId'),
    makeCleanupFunction(nodeCleanupCallbacks),
  ];

}
