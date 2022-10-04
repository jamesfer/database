import { start } from './start';
import { loadOptionsFromEnv } from './options';

function waitForSignal(): Promise<void> {
  return new Promise((res) => {
    process.on('SIGINT', res);
    process.on('SIGTERM', res);
  });
}

export async function main() {
  const options = loadOptionsFromEnv(process.env);

  const cleanup = await start(options);

  // Wait for signal
  await waitForSignal();

  await cleanup();
}

main().catch(error => console.log('Error occurred', error));
