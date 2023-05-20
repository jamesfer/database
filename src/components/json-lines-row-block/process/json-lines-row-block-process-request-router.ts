import { JsonLinesRowBlockProcess } from './json-lines-row-block-process';
import { RequestRouter } from '../../../routing/types/request-router';
import {
  RowBlockProcessAddressedRequest, RowBlockProcessAddressedRequestAction
} from '../../../routing/actions/process-addressed/row-block-process-addressed-request';
import { switchRouter } from '../../../routing/utils/switch-router';
import path from 'path';
import fs from 'fs';
import { AnyResponse } from '../../../routing/actions/any-response';

const DATA_DIR = './._data';
const DATA_FILE = 'data.jsonl';

export const jsonLinesRowBlockProcessRequestRouter =  (
  process: JsonLinesRowBlockProcess,
): RequestRouter<RowBlockProcessAddressedRequest, AnyResponse> => switchRouter('action')<RowBlockProcessAddressedRequest, AnyResponse>({
  async [RowBlockProcessAddressedRequestAction.Append](request): Promise<any> {
    // Create data directory if it does not exist
    const dataDirectoryPath = path.join(DATA_DIR, process.processId);
    await fs.promises.mkdir(dataDirectoryPath, { recursive: true });

    const dataFilePath = path.join(dataDirectoryPath, DATA_FILE);
    const jsonLines = request.rows.map(row => JSON.stringify(row)).join('\n') + '\n';
    await fs.promises.appendFile(dataFilePath, jsonLines);
  },
  async [RowBlockProcessAddressedRequestAction.ScanAll](request): Promise<any> {
    const dataFilePath = path.join(DATA_DIR, process.processId, DATA_FILE);
    const contents = await fs.promises.readFile(dataFilePath);
    const stringContents = contents.toString('utf-8');
    const nonEmptyLines = stringContents.split('\n').filter(line => line.length > 0);
    return nonEmptyLines.map(line => JSON.parse(line));
  },
});
