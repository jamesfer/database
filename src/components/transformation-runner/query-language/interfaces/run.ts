import { TaskEither } from 'fp-ts/TaskEither';
import { RpcInterface } from '../../../../rpc/rpc-interface';
import { AnyRequest } from '../../../../routing/requests/any-request';

export interface Item {
  fields: { [k: string]: any };
}

export interface Run<T> {
  run(query: T, rpcInterface: RpcInterface<AnyRequest>): TaskEither<string, Item[]>;
}
