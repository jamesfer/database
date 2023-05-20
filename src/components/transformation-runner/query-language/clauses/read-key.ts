import { Json } from 'fp-ts/Json';
import { expectArray, expectRecord, expectString } from '../../../../utils/json-utils';
import { chain, Either, filterOrElse, map, traverseArray } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { sequenceTuple } from '../../../../utils/fp';
import { ToJson } from '../interfaces/to-json';
import { FromJson } from '../interfaces/from-json';
import { Item, Run } from '../interfaces/run';
import { default as TE, TaskEither } from 'fp-ts/TaskEither';
import { FullyQualifiedPath } from '../../../../core/metadata-state/config';
import { RequestCategory } from '../../../../routing/actions/request-category';
import { ConfigAddressedGroupName } from '../../../../routing/actions/config-addressed/base-config-addressed-request';
import { KeyValueConfigGetRequest } from '../../../../routing/actions/config-addressed/key-value/get';
import {
  KeyValueConfigAddressedRequestActionType
} from '../../../../routing/actions/config-addressed/key-value/base-request';

export type ReadByKey = {
  name: 'ReadByKey';
  source: FullyQualifiedPath;
  key: string;
}

export const ReadByKey: FromJson<ReadByKey> & ToJson<ReadByKey> & Run<ReadByKey> = {
  fromJson(value): Either<string, ReadByKey> {
    return pipe(
      expectRecord(value),
      chain(record => sequenceTuple([
        expectString(record.name),
        pipe(
          expectArray(record.source),
          chain(traverseArray(expectString))
        ),
        expectString(record.key),
      ])),
      filterOrElse(
        ([name]) => name === 'ReadByKey',
        ([name]) => `Require name to equal 'ReadByKey'. Actually: ${name}`,
      ),
      map(([_, source, key]): ReadByKey => ({
        name: 'ReadByKey',
        // Need to cast here to remove the readonly flag
        source: source as string[],
        key,
      })),
    )
  },
  toJson(value): Json {
    return value;
  },
  run(query, rpcInterface): TaskEither<string, Item[]> {
    return TE.tryCatch(
      async () => {
        const getRequest: KeyValueConfigGetRequest = {
          category: RequestCategory.Config,
          group: ConfigAddressedGroupName.KeyValue,
          target: query.source,
          action: KeyValueConfigAddressedRequestActionType.Get,
          key: query.key,
        };
        const response = await rpcInterface.makeRequest(getRequest);
        return [{
          fields: {
            key: query.key,
            value: response,
          }
        }];
      },
      (error) => `Failed to run ReadKey query on ${query.source.join('/')}. Error: ${error}`,
    );
  },
}
