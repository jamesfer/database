import * as http from 'http';
import { MetadataState, ResourceRegistry } from '../../core';
import { createRestApi } from './api';

export interface RestApiConfig {
  port: number;
  host: string;
}

export async function startRestApi(
  restApiConfig: RestApiConfig,
  metadata: MetadataState,
  resourceRegistry: ResourceRegistry,
): Promise<() => Promise<void>> {
  const [app, unsubscribe] = createRestApi(metadata, resourceRegistry);

  const appServer = await new Promise<http.Server>((res) => {
    const server = app.listen(restApiConfig.port, restApiConfig.host, () => res(server));
  });

  return async () => {
    await new Promise<void>(res => appServer.close(() => res()));
    unsubscribe();
  };
}
