import { ASTNode } from '~/features/document/models/ASTNode';

export abstract class Block extends ASTNode {
  constructor() {
    super();
  }

  // currently Block is smallest unit node so this should return itself or null
  findNode(nodeId: string): ASTNode | null {
    if (this.id === nodeId) return this;
    return null;
  }
}
