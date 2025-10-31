/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import { createRangeFromPosition, locateRange } from '~/features/selection/SelectionMapper';

describe('SelectionMapper basic', () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    root.id = 'root';
    // two block elements with data-node-id
    const p1 = document.createElement('p');
    p1.setAttribute('data-node-id', 'n1');
    p1.textContent = 'hello';
    const p2 = document.createElement('p');
    p2.setAttribute('data-node-id', 'n2');
    p2.textContent = 'world!';
    root.appendChild(p1);
    root.appendChild(p2);
    document.body.appendChild(root);
  });

  it('locateRange and createRangeFromPosition roundtrip', () => {
    const p1 = root.querySelector('[data-node-id="n1"]') as HTMLElement;
    // create a range inside 'hello' at offset 2
    const textNode = p1.firstChild as Node;
    const r = document.createRange();
    r.setStart(textNode, 2);
    r.setEnd(textNode, 2);

    const pos = locateRange(root, r);
    expect(pos).not.toBeNull();
    expect(pos?.nodeId).toBe('n1');
    expect(pos?.offset).toBe(2);

    const r2 = createRangeFromPosition(root, { nodeId: 'n1', offset: 2 });
    expect(r2).not.toBeNull();
    expect(r2?.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(r2?.startOffset).toBe(2);
  });
});
