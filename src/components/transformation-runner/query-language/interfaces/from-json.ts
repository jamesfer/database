import { Json } from 'fp-ts/Json';
import { Either } from 'fp-ts/Either';

export interface FromJson<T> {
  fromJson(value: Json): Either<string, T>;
}
