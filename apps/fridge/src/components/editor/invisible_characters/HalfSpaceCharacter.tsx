import { InvisibleCharacter } from '@tiptap/extension-invisible-characters';

export class HalfSpaceCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'half-space',
      predicate: (char: string) => char === ' ',
    });
  }
}

export default HalfSpaceCharacter;
