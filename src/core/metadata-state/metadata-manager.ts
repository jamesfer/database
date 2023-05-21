import { FullyQualifiedPath } from './config';
import { MetadataDispatcher } from './metadata-dispatcher';
import { Trie } from '../../utils/trie';

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
