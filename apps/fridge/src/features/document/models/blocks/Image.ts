import { Block } from '~/features/document/models/blocks/Block';

export class Image extends Block {
  readonly type = 'image';
  constructor(
    private src: string, // tauri://app/.. or relative project path
    private alt?: string,
    private display?: 'block' | 'inline' | 'float-left' | 'float-right',
    private width?: number,
    private height?: number
  ) {
    super();
  }

  toPlain(): string {
    return this.src;
  }
}
