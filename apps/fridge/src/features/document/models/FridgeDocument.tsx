import { ASTNode } from '~/features/document/models/ASTNode';
import { Block } from '~/features/document/models/blocks/Block';
import { deleteWithRange as getSelectionDeletedRange } from '~/features/document/models/blocks/BlockUtils';
import { Heading } from '~/features/document/models/blocks/Heading';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';
import { SerializedSelection } from '~/features/selection/SelectionMapper';

export type WriteMode = 'ltr' | 'ttb';

export class FridgeDocument extends ASTNode {
  readonly type = 'document';
  children: Block[] = [];

  mode: WriteMode = 'ltr';

  // file association
  filePath?: string;

  constructor(
    private title: string | undefined,
    content: string
  ) {
    super();

    if (title) {
      this.children.push(new Heading(title, 1));
    }

    // lines = paragraph
    const lines = content.split('\n');

    if (lines.length === 0) {
      this.children.push(new Paragraph(''));
    } else {
      this.children = this.children.concat(
        lines.map<Paragraph>((line) => {
          return new Paragraph(line);
        })
      );
    }

    // this.children.push(new Image('/0827sledge_black.png', 'sledge', 'inline', 120, 75));
    // this.children.push(new Paragraph('wow thats an image...'));
  }

  findNode(nodeId: string): ASTNode | null {
    if (this.id === nodeId) return this;

    const founds = this.children
      .flatMap((node) => {
        return node.findNode(nodeId);
      })
      .filter((node): node is Exclude<typeof node, null> => node !== null);
    if (founds.length > 1) console.warn(`multiple node found for one id: ${founds}`);

    return founds?.length > 0 ? founds[0] : null;
  }

  // find index of node corresponds to given id.
  // note that this isn't recursive search!
  indexOf(nodeId: string): number {
    return this.children.findIndex((node) => node.id === nodeId);
  }

  insert(index: number, block: Block | Block[]) {
    if (!Array.isArray(block)) block = [block];
    this.children.splice(index, 0, ...block);
    return block;
  }

  insertAfter(beforeNodeId: string, block: Block | Block[]) {
    const index = this.indexOf(beforeNodeId);
    if (index < 0) {
      console.warn(`insertAfter called with non-existing nodeId (${beforeNodeId}) in document.`);
      return;
    }
    return this.insert(index + 1, block);
  }

  replace(nodeId: string, block: Block) {
    // endure that replacing block has same id as replaced node
    block.id = nodeId;

    this.children = this.children.map((node) => {
      if (node.id === nodeId) return block;
      return node;
    });
  }

  getTitle(): string | undefined {
    if (this.children.length > 0) {
      return this.children[0].toPlain();
    } else {
      return undefined;
    }
  }

  toPlain() {
    return this.children.map((node) => node.toPlain()).join('\n');
  }

  deleteInSelection(selection: SerializedSelection | null): {
    startNode: Block;
    endNode: Block;
  } | null {
    if (!selection) return null;
    const { start, end } = selection;
    console.log(selection);
    const startIndex = this.indexOf(start.nodeId);
    const endIndex = this.indexOf(end.nodeId);
    if (startIndex < 0 || endIndex < 0) return null;

    const startNode = this.children[startIndex];
    const endNode = this.children[endIndex];
    if (!startNode || !endNode) return null;

    if (startNode.id === endNode.id) {
      if (start.offset === end.offset) return null;

      const deleted = getSelectionDeletedRange(startNode, start.offset, end.offset);
      if (deleted) this.replace(startNode.id, deleted);
    } else {
      // 1: compute remaining part of start node (keep prefix before selection)
      const startRemaining = getSelectionDeletedRange(startNode, start.offset, null);
      // 2: compute remaining part of end node (keep suffix after selection)
      const endRemaining = getSelectionDeletedRange(endNode, null, end.offset);

      // 3: merge remaining parts into single node placed at startIndex
      // preserve start node type (and heading level if applicable)
      if (startRemaining) {
        const startText = startRemaining.toPlain();
        const endText = endRemaining ? endRemaining.toPlain() : '';
        const mergedText = startText + endText;

        if (startNode.type === 'heading') {
          const h = startNode as Heading;
          this.replace(startNode.id, new Heading(mergedText, h.level));
        } else {
          // paragraph or other text block -> keep as Paragraph
          this.replace(startNode.id, new Paragraph(mergedText));
        }
      }

      // 4: remove all nodes between startIndex and endIndex (exclusive of startIndex)
      const removeCount = endIndex - startIndex;
      if (removeCount > 0) {
        // remove the nodes after startIndex, including the old endNode
        this.children.splice(startIndex + 1, removeCount);
      }
    }

    return {
      startNode,
      endNode,
    };
  }
}
