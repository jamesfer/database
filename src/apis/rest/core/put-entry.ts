import { Request, Response } from 'express';
import { MetadataState, ResourceRegistry } from '../../../core';
import { putEntry as corePutEntry } from '../../../core/operations/put-entry';
import {
  ConfigEntry,
  RestApiEntry,
} from '../../../types/config';
import { FullyQualifiedPath } from '../../../config/scaffolding/config';
import { SimpleMemoryKeyValueEntry } from '../../../components/simple-memory-key-value-datastore/simple-memory-key-value-entry';

function parseEntry(id: FullyQualifiedPath, request: Request): ConfigEntry | string {
  switch (request.body.type) {
    case 'RestApi': {
      const dataset: string | undefined = request.body.dataset;
      if (!dataset) {
        return 'Missing body parameter dataset'
      }

      return new RestApiEntry(id, dataset.split('/'));
    }
    case 'KeyValue':
      return new SimpleMemoryKeyValueEntry(id);
    default:
      return `Unknown entry type: ${request.body.type}`;
  }
}

export const putEntry = (metadata: MetadataState, resourceRegistry: ResourceRegistry) => (request: Request, response: Response): void => {
  const entryPath: string | undefined = request.params.entry;
  if (!entryPath) {
    response.status(400).json({ error: 'Missing route parameter entry' });
    return;
  }

  const newEntry = parseEntry(entryPath.split('/'), request);
  if (typeof newEntry === 'string') {
    response.status(400).json({ error: newEntry });
    return;
  }

  corePutEntry(metadata, resourceRegistry, newEntry);
  response.sendStatus(200);
}
