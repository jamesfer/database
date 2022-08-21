import { Config, ConfigEntry, ConfigFolder, ConfigFolderItem} from '../../../types/config';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { FullyQualifiedPath } from '../../../config/scaffolding/config';

function updateConfigFolderItem(
  existingFolderItem: ConfigFolderItem | undefined,
  path: FullyQualifiedPath,
  newEntry: ConfigEntry,
): ConfigFolderItem {
  const [nextPathSegment, ...remainingPath] = path;

  if (!existingFolderItem) {
    if (nextPathSegment) {
      throw new Error('Cannot create a config entry inside a folder that does not exist');
    }

    return new ConfigFolderItem(newEntry, new ConfigFolder({}));
  }

  if (nextPathSegment) {
    return new ConfigFolderItem(
      existingFolderItem.item,
      updateConfigFolder(
        existingFolderItem.children,
        nextPathSegment,
        remainingPath,
        newEntry,
      ),
    );
  }

  return new ConfigFolderItem(
    newEntry,
    existingFolderItem.children,
  );
}

function updateConfigFolder(
  existingFolder: ConfigFolder,
  pathSegment: string,
  remainingPath: FullyQualifiedPath,
  newEntry: ConfigEntry,
): ConfigFolder {
  return new ConfigFolder({
    ...existingFolder.entries,
    [pathSegment]: updateConfigFolderItem(existingFolder.entries[pathSegment], remainingPath, newEntry),
  })
}

function updateConfig(existingConfig: Config, newEntry: ConfigEntry): Config {
  const [nextPathSegment, ...remainingPath] = newEntry.id;
  if (!nextPathSegment) {
    throw new Error('Cannot update the root entry of the config');
  }

  return new Config(updateConfigFolder(
    existingConfig.rootFolder,
    nextPathSegment,
    remainingPath,
    newEntry,
  ));
}

export function reduceConfigEntriesToConfig(configEntries$: Observable<ConfigEntry>): Observable<Config> {
  return configEntries$.pipe(scan(updateConfig, Config.empty()));
}
