import { ClusterNode } from '../../src/main/options';
import { makeRequest } from './make-request';
import {
  ComponentStateConfigAddressedRequestAction,
  GetComponentStateConfigAddressedRequest
} from '../../src/routing/actions/config-addressed/component-state/action';
import { ConfigAddressedGroupName } from '../../src/routing/actions/config-addressed/base-config-addressed-request';
import { RequestCategory } from '../../src/routing/actions/request-category';
import { FullyQualifiedPath } from '../../src/core/metadata-state/config';
import { ComponentReadyState } from '../../src/facades/component-state-config-request-handler';

export async function waitUntilComponentReady(
  node: ClusterNode,
  target: FullyQualifiedPath,
  timeout = 1000,
  interval = 50,
): Promise<void> {
  const componentStateRequest: GetComponentStateConfigAddressedRequest = {
    category: RequestCategory.Config,
    group: ConfigAddressedGroupName.ComponentState,
    action: ComponentStateConfigAddressedRequestAction.GetState,
    target,
  };

  const start = Date.now();
  let now = Date.now();
  let response;
  do {
    // Check the component state
    response = await makeRequest(node, componentStateRequest);
    if (response === new ComponentReadyState().toString()) {
      return;
    }

    // Wait a small amount of time
    await new Promise(r => setTimeout(r, interval));

    now = Date.now();
  } while (now - start < timeout);

  // Timed out
  throw new Error(`Timed out while waiting for component at ${target.join('/')} on node ${node.nodeId} to be ready. Last state: ${response}`);
}
