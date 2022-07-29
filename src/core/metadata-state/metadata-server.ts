import { Observable } from 'rxjs';
import { Config, ConfigEntry } from '../../types/config';
import { MetadataState } from './metadata-state';

export class MetadataServer {
  public static async initialize(): Promise<MetadataServer> {
    const state = new MetadataState();
    const cleanup = state.start();
    return new MetadataServer(state, cleanup);
  }

  private constructor(
    private readonly state: MetadataState,
    private readonly cleanupState: () => void,
  ) {}

  get config$(): Observable<Config> {
    return this.state.config$;
  }

  get currentConfig(): Config {
    return this.state.currentConfig;
  }

  publish(event: ConfigEntry) {
    this.state.publish(event);
  }
}
