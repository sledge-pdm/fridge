import { fonts } from '@sledge/theme';
import { Component } from 'solid-js';
import { documentsManager } from '~/features/document/DocumentsManager';
import { FridgeDocument } from '~/features/document/model';

interface Props {
  doc: FridgeDocument;
}

const EditorTitleInput: Component<Props> = (props) => {
  return (
    <input
      style={{
        padding: '32px 36px 0px 36px',
        'font-size': '24px',
        'font-family': `${fonts.ZFB09},${fonts.PM12}`,
        border: 'none',
        outline: 'none',
        width: '100%',
        'box-sizing': 'border-box',
        color: 'var(--color-on-background)',
      }}
      onInput={(e) => {
        const title = (e.target as HTMLInputElement).value;
        if (!title.trim()) return;
        documentsManager.updateActive({ title, associatedFilePath: undefined });
      }}
      value={props.doc.title}
    />
  );
};
export default EditorTitleInput;
