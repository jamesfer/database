import { Json } from 'fp-ts/Json';

export interface ToJson<T> {
  toJson(value: T): Json;
}
