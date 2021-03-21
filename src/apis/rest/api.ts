import { default as express, Express, json, raw } from 'express';
import { Subscription } from 'rxjs';
import { MetadataState } from '../../core/metadata-state/metadata-state';
import { ResourceRegistry } from '../../core';
import { createAccessApiRoutes } from './access-api/access-api-routes';
import { createCoreRoutes } from './core/core-routes';

export function createRestApi(metadata: MetadataState, resourceRegistry: ResourceRegistry): [Express, () => void] {
  const subscriptions = new Subscription();
  const app: Express = express();

  app.use(raw({ type: 'application/octet-stream' }));
  app.use(json());
  app.use(createCoreRoutes(metadata, resourceRegistry));
  app.use(createAccessApiRoutes(subscriptions, metadata, resourceRegistry));

  return [app, () => subscriptions.unsubscribe()];
}
