export interface Request {
  getField(key: string): any;
  getBodyAsString(): string;
  getBodyAsArrayBuffer(): ArrayBuffer;
}
