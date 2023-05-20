import { TaskEither } from 'fp-ts/TaskEither';
import { RpcInterface } from '../../../../rpc/rpc-interface';
import { AnyRequestResponse } from '../../../../routing/actions/any-request-response';

export interface Item {
  fields: { [k: string]: any };
}

export interface Run<T> {
  run(query: T, rpcInterface: RpcInterface<AnyRequestResponse>): TaskEither<string, Item[]>;
}
