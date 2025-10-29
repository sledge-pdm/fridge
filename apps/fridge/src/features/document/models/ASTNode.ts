import { nodeId } from '~/utils/ASTUtils';

export type NodeID = string;

export abstract class ASTNode {
  abstract readonly type: string;
  id: NodeID;

  constructor() {
    this.id = nodeId();
  }

  abstract toPlain(): string;

  toString(): string {
    return this.toPlain();
  }
}
