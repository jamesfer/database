import { BinaryLike, createHash } from 'crypto';
import { assert } from '../../../utils/assert';

const SHA256_OUTPUT_BYTES = 256 / 8;
export const SHA256_MAX_VALUE = bufferToBigInt(Buffer.from(Uint8Array.of(...Array(SHA256_OUTPUT_BYTES).fill((1 << 8) - 1))));

function hashValue(value: BinaryLike, algorithm: string): Buffer {
  const hash = createHash(algorithm);
  hash.update(value);
  return hash.digest();
}

function bufferToBigInt(buffer: Buffer): bigint {
  const arrayBuffer = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
  const bitsPerElement = BigInt(arrayBuffer.BYTES_PER_ELEMENT * 8);

  let result = BigInt(0);
  for (const value of arrayBuffer.values()) {
    result = (result << bitsPerElement) + BigInt(value);
  }
  return result;
}

export function findHashPartition(value: BinaryLike, partitions: number): number {
  const partitionSize = SHA256_MAX_VALUE / BigInt(partitions);
  const numericValue = bufferToBigInt(hashValue(value, 'sha256'));
  const selectedPartition = (numericValue / partitionSize);
  assert(selectedPartition < partitions, `There is an error in the hashing algorithm. A partition for a value was greater than the total number of partitions. Value: ${value.toString()}, partitions: ${partitions}, selected partition: ${selectedPartition}`);
  return Number(selectedPartition);
}
