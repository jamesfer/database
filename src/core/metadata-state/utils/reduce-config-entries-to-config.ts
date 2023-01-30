import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import {
  Config,
  ConfigFolder,
  ConfigFolderItem,
  FullyQualifiedPath
} from '../config';
import { AllComponentConfigurations } from '../../../components/scaffolding/all-component-configurations';

function updateConfigFolderItem(
  existingFolderItem: ConfigFolderItem | undefined,
  path: FullyQualifiedPath,
  newEntry: AllComponentConfigurations,
): ConfigFolderItem {
  const [nextPathSegment, ...remainingPath] = path;

  if (!existingFolderItem) {
    if (nextPathSegment) {
      throw new Error('Cannot create a config entry inside a folder that does not exist: ' + nextPathSegment);
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
  newEntry: AllComponentConfigurations,
): ConfigFolder {
  return new ConfigFolder({
    ...existingFolder.entries,
    [pathSegment]: updateConfigFolderItem(existingFolder.entries[pathSegment], remainingPath, newEntry),
  })
}

function updateConfig(existingConfig: Config, [newPath, newEntry]: [FullyQualifiedPath, AllComponentConfigurations]): Config {
  const [nextPathSegment, ...remainingPath] = newPath;
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

export function reduceConfigEntriesToConfig(
  configEntries$: Observable<[FullyQualifiedPath, AllComponentConfigurations]>,
): Observable<Config> {
  return configEntries$.pipe(scan(updateConfig, Config.empty()));
}
