import { Json } from 'fp-ts/Json';

export interface Serializable<T> {
  serialize(object: T): Json;
  deserialize(string: Json): T;
}
