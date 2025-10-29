import { ASTNode } from '~/features/document/models/ASTNode';
import { Block } from '~/features/document/models/blocks/Block';
import { Heading } from '~/features/document/models/blocks/Heading';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';

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
  }

  insert(index: number, block: Block) {
    this.children = this.children.splice(index, 0, block);
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
}
