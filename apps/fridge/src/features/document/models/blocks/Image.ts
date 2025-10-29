import { Block } from '~/features/document/models/blocks/Block';

export class Image extends Block {
  readonly type = 'image';
  constructor(
    public src: string, // tauri://app/.. or relative project path
    public alt?: string,
    public display?: 'block' | 'inline' | 'float-left' | 'float-right',
    public width?: number,
    public height?: number
  ) {
    super();
  }

  toPlain(): string {
    return this.src;
  }
}
