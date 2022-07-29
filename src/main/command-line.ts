import { main } from './index';

function waitForSignal(): Promise<void> {
  return new Promise((res) => {
    process.on('SIGINT', res);
    process.on('SIGTERM', res);
  });
}

export async function runCommandLine() {
  const cleanup = await main({ port: 3000 });

  // Wait for signal
  await waitForSignal();

  await cleanup();
}

runCommandLine()
  .catch(error => console.log('Error occurred', error));
