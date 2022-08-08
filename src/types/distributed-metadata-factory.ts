import { DistributedMetadataFacade } from '../facades/distributed-metadata-facade';

export interface DistributedMetadataFactory {
  createDistributedMetadata(nodeId: string): Promise<DistributedMetadataFacade>;
}
