import { ConfigEntry } from '../types/config';
import { BaseFacade } from './scaffolding/base-facade';

export type ConfigFacadeConstructor<C extends ConfigEntry> = (entry: C) => BaseFacade;
