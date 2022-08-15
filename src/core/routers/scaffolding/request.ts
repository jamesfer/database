import { FullyQualifiedPath } from '../../../types/config';

export enum RequestType {
  Path = 'Path',
  Node = 'Node',
}

export interface PathRequestTarget {
  type: RequestType.Path;
  path: FullyQualifiedPath;
}

export interface NodeRequestTarget {
  type: RequestType.Node;
  nodeId: string;
}

export interface Request {
  target: PathRequestTarget | NodeRequestTarget;
}

