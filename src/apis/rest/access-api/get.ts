import { Request, Response } from 'express';
import { ResourceRegistry } from '../../../core';
import { Config, ConfigEntry, RestApiEntry } from '../../../types/config';
import { keyValueApi } from '../../../stores/key-value';
import { SimpleMemoryKeyValueEntry } from '../../../components/simple-memory-key-value-datastore/simple-memory-key-value-entry';

export const get = (resourceRegistry: ResourceRegistry) => async (
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

    const data = await keyValueApi.get(datasetEntry, resources, key);
    response.setHeader('Content-Type', 'application/octet-stream');
    response.status(200).send(data);
    return;
  }

  response.status(400).json({ error: 'Unknown dataset type' }).sendStatus(400);
}
