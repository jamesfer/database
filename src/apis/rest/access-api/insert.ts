import { Request, Response } from 'express';
import { ResourceRegistry } from '../../../core';
import { Config, ConfigEntry, KeyValueDataset, RestApi } from '../../../types/config';
import { keyValueApi } from '../../../stores/key-value';

export const insert = (resourceRegistry: ResourceRegistry) => async (
  request: Request,
  response: Response,
  config: Config,
  restApiEntry: RestApi,
  datasetEntry: ConfigEntry,
): Promise<void> => {
  if (datasetEntry instanceof KeyValueDataset) {
    const key = request.query.key;
    if (typeof key !== 'string') {
      response.status(400).json({ error: 'Missing key query parameter' });
      return;
    }

    const body: unknown = request.body;
    if (!Buffer.isBuffer(body)) {
      response.status(400).json({ error: `Body should be an array buffer. Received ${body}` });
      return;
    }

    const resources = resourceRegistry.getResources('keyValue', datasetEntry.id.join('/'));
    if (resources === undefined) {
      response.status(400).json({ error: `Dataset has been corrupted. No resources found for id ${datasetEntry.id.join('/')}` });
      return;
    }

    await keyValueApi.put(datasetEntry, resources, key, body);
    response.sendStatus(200);
    return;
  }

  response.status(400).json({ error: 'Unknown dataset type' });
}
