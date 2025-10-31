import { Block } from '~/features/document/models/blocks/Block';
import { Heading } from '~/features/document/models/blocks/Heading';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';

export function deleteWithRange(block: Block, start: number | null, end: number | null): Block | null {
  let result: Block | null = null;

  if (block.type === 'paragraph' || block.type === 'heading') {
    const content = block.toPlain();
    const s = start !== null ? start : 0;
    const e = end !== null ? end : content.length;

    // 残る部分を計算：先頭から s まで と e から末尾までをつなぐ
    const remaining = content.slice(0, s) + content.slice(e);

    // ノードの種類を保持して返す（空文字でも置換して id 安定性を保つ）
    if (block.type === 'heading') {
      const b = block as Heading;
      result = new Heading(remaining, b.level);
    } else {
      result = new Paragraph(remaining);
    }
  }

  return result;
}
