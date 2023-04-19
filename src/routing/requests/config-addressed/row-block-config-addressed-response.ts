export interface ScanAllRowBlockConfigAddressedResponse {
  rows: any[],
}

export interface AppendRowBlockConfigAddressedResponse {
}

export type RowBlockConfigAddressedResponse =
  | ScanAllRowBlockConfigAddressedResponse
  | AppendRowBlockConfigAddressedResponse;
