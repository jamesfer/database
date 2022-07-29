import { Request, Response } from 'express';
import { MetadataState } from '../../../core';
import coreGetEntry from '../../../core/operations/get-entry';

const getEntry = (
  metadata: MetadataState,
) => (
  request: Request,
  response: Response,
): void => {
  const entryPath: string | undefined = request.params.entry;
  if (!entryPath) {
    response.status(400).json({ error: 'Missing route parameter entry' });
    return;
  }

  const entry = coreGetEntry(metadata, entryPath.split('/'));
  response.json(entry);
}

export default getEntry;
