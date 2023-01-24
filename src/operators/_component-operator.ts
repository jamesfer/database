import { Observable } from 'rxjs';
import { Refine } from '../types/refine';
import { ConfigEntry } from '../config/config-entry';
import { FullyQualifiedPath } from '../config/config';

export interface ConfigLifecycle<E extends ConfigEntry> {
  path: FullyQualifiedPath,
  name: E['name'];
  events$: Observable<E>;
}

export type ConfigLifecycleFromName<N extends ConfigEntry['name']> = ConfigLifecycle<Refine<ConfigEntry, { readonly name: N }>>;

export type ConfigLifecycles = {
  [S in ConfigEntry['name']]: ConfigLifecycleFromName<S>;
};

export type AnyConfigLifecycle = ConfigLifecycles[ConfigEntry['name']];

export type ComponentOperator<N extends keyof ConfigLifecycles> = (lifecycle: ConfigLifecycles[N]) => Observable<void>;
