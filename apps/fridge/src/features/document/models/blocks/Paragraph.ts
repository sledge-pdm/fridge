import { Block } from '~/features/document/models/blocks/Block';

export class Paragraph extends Block {
  readonly type = 'paragraph';

  constructor(private text: string = '') {
    super();
  }

  toPlain(): string {
    return this.text;
  }
}
