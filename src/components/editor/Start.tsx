import { css } from '@acab/ecsstatic';
import { Component, createMemo, createSignal, onMount } from 'solid-js';
import { addDocument, fromId, newDocument, openDocument } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/open';
import { editorStore } from '~/stores/EditorStore';

const nothingContainer = css`
  display: flex;
  padding: 48px;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
`;

const nothingTitle = css`
  font-size: 42px;
  font-family: ZFB31;
  margin-bottom: 16px;
`;

const nothingText = css`
  font-size: 16px;
  margin-bottom: 12px;
  font-family: ZFB08;
`;

const EditorStartContent: Component = () => {
  const activeDoc = createMemo(() => fromId(editorStore.activeDocId));

  const [timeType, setTimeType] = createSignal<'morning' | 'day' | 'night'>();

  onMount(() => {
    const hourInDay = new Date().getHours();
    if (3 < hourInDay && hourInDay < 10) setTimeType('morning');
    else if (10 <= hourInDay && hourInDay < 17) setTimeType('day');
    else if ((17 <= hourInDay && hourInDay < 24) || hourInDay <= 3) setTimeType('night');
  });

  const greet = createMemo(() => {
    switch (timeType()) {
      case 'morning':
        return 'GOOD MORNING.';
      case 'day':
        return 'HELLO.';
      case 'night':
        return 'GOOD EVENING.';
      default:
        return 'HI.';
    }
  });

  return (
    <div class={nothingContainer}>
      <p class={nothingTitle}>{greet()}</p>
      <p class={nothingText}>Start writing by:</p>
      <a
        class={nothingText}
        onClick={() => {
          addDocument(newDocument());
        }}
      >
        {activeDoc()?.getId()}
        &gt; new document.
      </a>
      <a
        class={nothingText}
        onClick={async () => {
          const path = await showChooseFileDialog();
          if (path) openDocument(path);
        }}
      >
        &gt; open existing files.
      </a>
    </div>
  );
};

export default EditorStartContent;
