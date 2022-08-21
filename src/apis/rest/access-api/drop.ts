import { Request, Response } from 'express';
import { ResourceRegistry } from '../../../core';
import { Config, ConfigEntry, RestApiEntry } from '../../../types/config';
import { keyValueApi } from '../../../stores/key-value';
import { SimpleMemoryKeyValueEntry } from '../../../components/simple-memory-key-value-datastore/simple-memory-key-value-entry';

export const drop = (resourceRegistry: ResourceRegistry) => async (
  request: Request,
  response: Response,
  config: Config,
  restApiEntry: RestApiEntry,
  datasetEntry: ConfigEntry,
): Promise<void> => {
  if (datasetEntry instanceof SimpleMemoryKeyValueEntry) {
    const key = request.query.key;
    if (typeof key !== 'string') {
      response.status(400).json({ error: 'Missing key query parameter' });
      return;
    }

    const resources = resourceRegistry.getResources('keyValue', datasetEntry.id.join('/'));
    if (resources === undefined) {
      response.status(400).json({ error: `Dataset has been corrupted. No resources found for id ${datasetEntry.id}` });
      return;
    }

    await keyValueApi.drop(datasetEntry, resources, key);
    response.sendStatus(200);
    return;
  }

  response.status(400).json({ error: 'Unknown dataset type' });
}
