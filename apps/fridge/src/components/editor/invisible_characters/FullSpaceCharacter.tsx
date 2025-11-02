import { InvisibleCharacter } from '@tiptap/extension-invisible-characters';

export class FullSpaceCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'full-space',
      predicate: (char: string) => char === '　',
    });
  }
}

export default FullSpaceCharacter;
