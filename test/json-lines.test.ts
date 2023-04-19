import { ClusterNode } from '../src/main/options';
import { createCluster } from './scaffolding/create-cluster';
import {
  JsonLinesRowBlockConfiguration
} from '../src/components/json-lines-row-block/main-component/json-lines-row-block-configuration';
import { makeRequest } from './scaffolding/make-request';
import { MetadataTemporaryAction } from '../src/routing/requests/metadata-temporary/metadata-temporary-request';
import { RequestCategory } from '../src/routing/types/request-category';
import { ConfigEntryCodec } from '../src/core/commit-log/config-entry-codec';
import { waitUntilComponentReadyOnAllNodes } from './scaffolding/wait-until-component-ready-on-all-nodes';
import { range } from 'lodash';
import {
  AppendRowBlockConfigAddressedRequest,
  RowBlockConfigAddressedRequestAction, ScanAllRowBlockConfigAddressedRequest
} from '../src/routing/requests/config-addressed/row-block-config-addressed-request';
import { ConfigAddressedGroupName } from '../src/routing/requests/config-addressed/base-config-addressed-request';

describe('JsonLinesRowBlock e2e', () => {
  let cluster: { node0: ClusterNode, node1: ClusterNode, node2: ClusterNode };
  let cleanup: (() => Promise<void>);

  beforeEach(async () => {
    [cluster, cleanup] = await createCluster(3, 10);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('reads and writes json values', async () => {
    // Create a json lines datastore
    const datasetPath = ['jsonLinesDataset'];
    const datasetConfig = new JsonLinesRowBlockConfiguration();
    const createDatasetResponse = await makeRequest(cluster.node0, {
      category: RequestCategory.MetadataTemporary,
      action: MetadataTemporaryAction.Put,
      path: datasetPath,
      entry: await new ConfigEntryCodec().serialize(datasetConfig),
    });
    expect(createDatasetResponse).not.toMatch('Error');

    await waitUntilComponentReadyOnAllNodes(Object.values(cluster), datasetPath);

    // Write some data to the datastore
    const records = range(10).map(index => ({
      type: 'Test record',
      index,
      someNestedData: {
        values: [
          { a: 1 },
          { b: 2 },
        ]
      },
    }));
    const appendRequest: AppendRowBlockConfigAddressedRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.RowBlock,
      action: RowBlockConfigAddressedRequestAction.Append,
      target: datasetPath,
      rows: records,
    };
    const appendResponse = await makeRequest(cluster.node1, appendRequest);
    expect(appendResponse).not.toMatch('Error');

    // Small delay
    await new Promise(r => setTimeout(r, 10));

    // Read the records
    const scanRequest: ScanAllRowBlockConfigAddressedRequest = {
      category: RequestCategory.ConfigAction,
      group: ConfigAddressedGroupName.RowBlock,
      action: RowBlockConfigAddressedRequestAction.ScanAll,
      target: datasetPath,
    };
    const scanResponse = await makeRequest(cluster.node1, scanRequest);
    expect(scanResponse).not.toMatch('Error');
    expect(scanResponse).toEqual(records);
  });
});