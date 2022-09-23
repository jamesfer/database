export interface Options {
  nodeId: string;
  leaderId: string;
  clusterNodes: string[];
}

export function loadOptions(processEnv: { [key: string]: string | undefined }): Options {
  const nodeId = processEnv['DATABASE_NODE_ID'];
  const leaderId = processEnv['DATABASE_LEADER_ID'];
  const clusterNodes = processEnv['DATABASE_CLUSTER_NODES']?.split(',');

  if (!nodeId || !leaderId || !clusterNodes) {
    throw new Error(`Failed to load environment: ${processEnv}`);
  }

  return { nodeId, leaderId, clusterNodes };
}
