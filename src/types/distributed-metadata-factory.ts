import { DistributedMetadataInterface } from './distributed-metadata-interface';

export interface DistributedMetadataFactory {
  createDistributedMetadata(nodeId: string): Promise<DistributedMetadataInterface>;
}
