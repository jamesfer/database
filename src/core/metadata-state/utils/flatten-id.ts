import { FullyQualifiedPath } from '../../../types/config';

export function flattenId(id: FullyQualifiedPath): string {
  return id.join('/');
}
