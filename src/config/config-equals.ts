import { ConfigEntry } from './config-entry';

export function configEquals(left: ConfigEntry, right: ConfigEntry): boolean {
  return left.name === right.name && left.equals(right as any);
}
