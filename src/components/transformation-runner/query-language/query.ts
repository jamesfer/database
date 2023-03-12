// export type AndFilterClause = {
//   name: 'AndFilterClause';
//   filters: Filter[];
// };
//
// export type OrFilterClause = {
//   name: 'OrFilterClause';
//   filters: Filter[];
// }

import { Json } from 'fp-ts/Json';
import { pipe } from 'fp-ts/function';
import { Either } from 'fp-ts/Either';
import { ReadByKey } from './clauses/read-key';
import { ToJson } from './interfaces/to-json';
import { FromJson } from './interfaces/from-json';
import { Item, Run } from './interfaces/run';
import { TaskEither } from 'fp-ts/TaskEither';

// export interface EqualsFilterClause {
//   name: 'EqualsFilterClause';
//   columnName: string;
//   value: any;
// }
//
// export type FilterExpression = EqualsFilterClause;
//
// export interface Filter {
//   name: 'Filter';
//   filter: FilterExpression;
// }
//
//
// export type Write = {
//   name: 'Write';
//   destination: string;
// }
//
// export const Write: FromJson<Write> & ToJson<Write> = {
//   fromJson(value: Json): Option<Write> {
//     if (
//       isRecord(value)
//         && value.name == 'Write'
//         && 'destination' in value
//     ) {
//       return some(value as Write);
//     }
//     return none;
//   },
//   toJson(value: Write): Json {
//     return value;
//   },
// }

export type Query =
  | ReadByKey;

export const Query: ToJson<Query> & FromJson<Query> & Run<Query> = {
  fromJson(value) {
    return pipe(
      ReadByKey.fromJson(value),
      // alt(() => Read.fromJson(value) as Option<Query>),
    );
  },
  toJson(value) {
    switch (value.name) {
      case 'ReadByKey':
        return ReadByKey.toJson(value);
    }
  },
  run(query, metadataManager) {
    switch (query.name) {
      case 'ReadByKey':
        return ReadByKey.run(query, metadataManager);
    }
  }
}

// export type Query = QueryClause[];
