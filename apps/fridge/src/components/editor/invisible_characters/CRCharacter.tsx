import { InvisibleCharacter } from '@tiptap/extension-invisible-characters';

export class CRCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'carriage-return',
      predicate: (char: string) => char === '\r',
    });
  }
}

export default CRCharacter;
