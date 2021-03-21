import { Router } from 'express';
import { ResourceRegistry } from '../../../core';
import { MetadataState } from '../../../core/metadata-state/metadata-state';
import { putEntry } from './put-entry';

export function createCoreRoutes(metadata: MetadataState, resourceRegistry: ResourceRegistry): Router {
  const router = Router({ caseSensitive: true });

  // router.put('/:path(((?!data(\/|$))[^/]+)(\/(?!data(\/|$))[^/]+){0,})', putEntry(metadata));
  // router.put('/:entry((([^\/]|[\/])+))', putEntry(metadata));
  router.put('/:entry((([^\/]|[\/])+(?<!\/data\/?)))', putEntry(metadata, resourceRegistry));

  return router;
}


