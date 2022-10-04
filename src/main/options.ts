export interface ClusterNode {
  nodeId: string;
  host: string;
  generalRpcPort: number;
  metadataRpcPort: number;
}

export interface Options {
  nodeId: string;
  leaderId: string;
  clusterNodes: ClusterNode[];
}

export function loadOptionsFromEnv(processEnv: { [key: string]: string | undefined }): Options {
  const nodeId = processEnv['DATABASE_NODE_ID'];
  const leaderId = processEnv['DATABASE_LEADER_ID'];
  const clusterNodeStrings = processEnv['DATABASE_CLUSTER_NODES']?.split(',');

  if (!nodeId || !leaderId || !clusterNodeStrings || clusterNodeStrings.length === 0) {
    throw new Error(`Failed to load options from environment: ${processEnv}`);
  }

  const clusterNodes: ClusterNode[] = clusterNodeStrings.map(string => {
    const [nodeId, host, generalRpcPortString, metadataRpcPortString] = string.split(':');
    const generalRpcPort = generalRpcPortString && +generalRpcPortString;
    const metadataRpcPort = metadataRpcPortString && +metadataRpcPortString;
    if (!nodeId || !host || !generalRpcPort || !metadataRpcPort || Number.isNaN(generalRpcPort) || Number.isNaN(metadataRpcPort)) {
      throw new Error(`Failed to read cluster node configuration from environment: ${string}`);
    }

    return { nodeId, host, generalRpcPort, metadataRpcPort };
  });

  return { nodeId, leaderId, clusterNodes };
}
