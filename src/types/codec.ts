export interface Codec<T, S> {
  serialize(value: T): Promise<S>;
  deserialize(serialized: S): Promise<T | undefined>;
}
