import { FullyQualifiedPath } from '../../../core/metadata-state/config';
import { RequestCategory } from '../../types/request-category';
import { BaseRequest } from '../base-request';

export enum MetadataTemporaryAction {
  Get = 'Get',
  Put = 'Put',
  Bootstrap = 'Bootstrap',
}

interface RequestBase<A extends MetadataTemporaryAction> extends BaseRequest {
  category: RequestCategory.MetadataTemporary;
  action: A;
}

export interface MetadataTemporaryGetRequest extends RequestBase<MetadataTemporaryAction.Get> {
  path: FullyQualifiedPath;
}

export interface MetadataTemporaryPutRequest extends RequestBase<MetadataTemporaryAction.Put> {
  path: FullyQualifiedPath;
  entry: string;
}

export interface MetadataTemporaryBootstrapRequest extends RequestBase<MetadataTemporaryAction.Bootstrap> {
  path: FullyQualifiedPath;
}

export type MetadataTemporaryRequest =
  | MetadataTemporaryGetRequest
  | MetadataTemporaryPutRequest
  | MetadataTemporaryBootstrapRequest;
