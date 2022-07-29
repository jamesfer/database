import { Router } from 'express';
import { ResourceRegistry, MetadataState } from '../../../core';
import { putEntry } from './put-entry';
import getEntry from './get-entry';

export function createCoreRoutes(metadata: MetadataState, resourceRegistry: ResourceRegistry): Router {
  const router = Router({ caseSensitive: true });

  // router.put('/:path(((?!data(\/|$))[^/]+)(\/(?!data(\/|$))[^/]+){0,})', putEntry(metadata));
  // router.put('/:entry((([^\/]|[\/])+))', putEntry(metadata));
  router.put('/:entry((([^\/]|[\/])+(?<!\/data\/?)))', putEntry(metadata, resourceRegistry));
  router.get('/:entry((([^\/]|[\/])+(?<!\/data\/?)))', getEntry(metadata));

  return router;
}
