import { css } from '@acab/ecsstatic';
import { Component, createMemo, createSignal, onMount } from 'solid-js';
import { documentsManager } from '~/features/document/DocumentsManager';
import { newDocument, openDocument } from '~/features/document/service';
import { useActiveDoc, useDocuments } from '~/features/document/useDocuments';
import { showChooseFileDialog } from '~/features/io/choose';

const nothingContainer = css`
  display: flex;
  padding: 36px;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
`;
const nothingTitle = css`
  font-size: 48px;
  font-family: ZFB31;
  margin-bottom: 16px;
`;
const nothingText = css`
  font-size: 8px;
  margin-bottom: 12px;
  font-family: ZFB08;
`;

const EditorStartContent: Component = () => {
  const { activeDoc } = useActiveDoc();

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
          documentsManager.addDocument(newDocument());
        }}
      >
        {activeDoc()?.id}
        &gt; new document.
      </a>
      {JSON.stringify(activeDoc() ?? 'undefined')}
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
