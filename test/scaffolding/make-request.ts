import { AnyRequest, AnyRequestCodec } from '../../src/routing/requests/any-request';
import fetch from 'node-fetch';
import { ClusterNode } from '../../src/main/options';

export async function makeRequest(node: ClusterNode, request: AnyRequest, attemptsRemaining = 3): Promise<string> {
  const url = `http://${node.host}:${node.generalRpcPort}`;
  const requestString = await new AnyRequestCodec().serialize(request);
  const response = await fetch(url, {
    method: 'POST',
    body: requestString,
  });
  const textResponse = await response.text();

  // Check if the request needs to be retried
  if (attemptsRemaining > 0 && /is not ready yet/.test(textResponse)) {
    await new Promise(r => setTimeout(r, 50));
    return makeRequest(node, request, attemptsRemaining - 1);
  }

  return textResponse;
}
