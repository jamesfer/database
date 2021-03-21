import { Request, Response } from 'express';
import { ResourceRegistry } from '../../../core';
import { MetadataState } from '../../../core/metadata-state/metadata-state';
import { putEntry as corePutEntry } from '../../../core/operations/put-entry';
import {
  ConfigEntry,
  FullyQualifiedPath,
  KeyValueDataset,
  RestApi,
} from '../../../types/config';
import { keyValueApi } from '../../../stores/key-value/index';

function parseEntry(id: FullyQualifiedPath, request: Request, response: Response): ConfigEntry | string {
  switch (request.body.type) {
    case 'RestApi': {
      const dataset: string | undefined = request.body.dataset;
      if (!dataset) {
        return 'Missing body parameter dataset'
      }

      return new RestApi(id, dataset.split('/'));
    }
    case 'KeyValue':
      return new KeyValueDataset(id);
    default:
      return `Unknown entry type: ${request.body.type}`;
  }
}

export const putEntry = (metadata: MetadataState, resourceRegistry: ResourceRegistry) => (request: Request, response: Response): void => {
  const entry: string | undefined = request.params.entry;
  if (!entry) {
    response.status(400).json({ error: 'Missing route parameter entry' });
    return;
  }

  const newEntry = parseEntry(entry.split('/'), request, response);
  if (typeof newEntry === 'string') {
    response.status(400).json({ error: newEntry });
    return;
  }

  corePutEntry(metadata, newEntry);
  if (newEntry instanceof KeyValueDataset) {
    keyValueApi.putEntry(newEntry, resourceRegistry);
  }

  response.sendStatus(200);
}
