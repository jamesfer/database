import { ClusterNode } from '../../src/main/options';
import { FullyQualifiedPath } from '../../src/core/metadata-state/config';
import { waitUntilComponentReady } from './wait-until-component-ready';

export async function waitUntilComponentReadyOnAllNodes(
  nodes: ClusterNode[],
  target: FullyQualifiedPath,
  timeout = 1000,
  interval = 50,
): Promise<void> {
  await Promise.all(nodes.map(node => waitUntilComponentReady(node, target, timeout, interval)));
}
