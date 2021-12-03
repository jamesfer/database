export interface KeyedUpdate<T> {
  readonly id: string;
  readonly timestamp: number;
  readonly path: string;
  readonly state: T | undefined;
}
