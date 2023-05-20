import { RequestCategory } from '../request-category';
import { FullyQualifiedPath } from '../../../core/metadata-state/config';

export enum ConfigAddressedGroupName {
  KeyValue = 'KeyValue',
  TransformationRunner = 'TransformationRunner',
  ComponentState = 'ComponentState',
  RowBlock = 'RowBlock',
}

export interface BaseConfigAddressedRequest<G extends ConfigAddressedGroupName> {
  category: RequestCategory.Config;
  target: FullyQualifiedPath;
  group: G;
}
