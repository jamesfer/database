import { Observable } from 'rxjs';
import { Config } from '../../types/config';
import { MetadataState } from './metadata-state';

export { MetadataState };

export function startMetadataServer(): [Observable<Config>, () => void] {
  const metadataState = new MetadataState();
  return [metadataState.config$, metadataState.start()];
}
