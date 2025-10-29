import { Block } from '~/features/document/models/blocks/Block';

export type HeadingLevel = 1 | 2 | 3 | 4;

export class Heading extends Block {
  readonly type = 'heading';

  constructor(
    private text: string,
    public level: HeadingLevel
  ) {
    super();
  }

  toPlain(): string {
    return this.text;
  }
}
