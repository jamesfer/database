import { FullyQualifiedPath } from './config';
import { MetadataDispatcher } from './metadata-dispatcher';

class Trie<T> {
  static empty<T>(): Trie<T> {
    return new Trie<T>(undefined, {});
  }

  constructor(
    public value: T | undefined,
    public readonly children: { [k: string]: Trie<T> },
  ) {}

  // setNode(node: MetadataDispatcher) {
  //   this.node = node;
  // }

  putValue(path: FullyQualifiedPath, value: T): void {
    const [firstSegment, ...remainingPath] = path;
    if (!firstSegment) {
      // Set this node's value
      this.value = value;
      return;
    }

    let child = this.children[firstSegment];
    if (!child) {
      child = Trie.empty();
      this.children[firstSegment] = child;
    }

    child.putValue(remainingPath, value);
  }

  getClosestValue(
    path: FullyQualifiedPath,
    fallback: T | undefined = undefined,
  ): T | undefined {
    const currentFallback = this.value || fallback;

    const [firstSegment, ...remainingPath] = path;
    if (!firstSegment) {
      return currentFallback;
    }

    let child = this.children[firstSegment];
    if (child) {
      return child.getClosestValue(remainingPath, currentFallback);
    }

    return currentFallback;
  }
}

export class MetadataManager {
  public static async initialize(): Promise<MetadataManager> {
    return new MetadataManager();
  }

  private dispatchers: Trie<MetadataDispatcher> = Trie.empty();

  private constructor() {}

  registerDispatcher(path: FullyQualifiedPath, dispatcher: MetadataDispatcher): void {
    this.dispatchers.putValue(path, dispatcher);
  }

  getClosestDispatcherMatching(path: FullyQualifiedPath): MetadataDispatcher | undefined {
    return this.dispatchers.getClosestValue(path);
  }
}
