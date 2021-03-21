import { Request, Response, Router } from 'express';
import { Subject, Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { MetadataState, ResourceRegistry } from '../../../core';
import { Config, ConfigEntry, RestApi } from '../../../types/config';
import { drop } from './drop';
import { get } from './get';
import { insert } from './insert';

const createHandler = (
  subscription: Subscription,
  metadata: MetadataState,
  handlerWithConfig: (
    request: Request,
    response: Response,
    config: Config,
    restApiConfig: RestApi,
    datasetConfig: ConfigEntry,
  ) => Promise<void>,
) => {
  const requestSubject = new Subject<[Request, Response]>();
  const requestSubscription = requestSubject.pipe(
    withLatestFrom(metadata.config$),
  ).subscribe(([[request, response], config]) => {
    const restApiEntryName = request.params.entry;
    if (!restApiEntryName) {
      response.status(400).json({ error: 'Missing required parameter: entry' });
      return;
    }

    const restApiEntry = config.entries[restApiEntryName];
    if (!(restApiEntry && restApiEntry instanceof RestApi)) {
      response.status(400).json({ error: `Rest api entry with name ${restApiEntryName} does not exist` });
      return;
    }

    const datasetEntry = config.entries[restApiEntry.dataset.join('/')];
    if (!datasetEntry) {
      response.status(400).json({ error: `Entry with name ${restApiEntry.dataset.join('/')} does not exist`});
      return;
    }

    handlerWithConfig(request, response, config, restApiEntry, datasetEntry);
  });

  subscription.add(requestSubscription);

  return (request: Request, response: Response) => requestSubject.next([request, response]);
}

export function createAccessApiRoutes(subscription: Subscription, metadata: MetadataState, resourceRegistry: ResourceRegistry): Router {
  const router = Router({ caseSensitive: true });

  router.post(
    '/:entry((([^\\/]|[\\/])+))/data',
    createHandler(subscription, metadata, insert(resourceRegistry)),
  );
  router.get(
    '/:entry((([^\\/]|[\\/])+))/data',
    createHandler(subscription, metadata, get(resourceRegistry)),
  );
  router.delete(
    '/:entry((([^\\/]|[\\/])+))/data',
    createHandler(subscription, metadata, drop(resourceRegistry)),
  );

  return router;
}
