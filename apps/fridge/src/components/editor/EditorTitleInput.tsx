import { fonts } from '@sledge/theme';
import { Component } from 'solid-js';
import { getCurrentDocument, updateCurrentDocument } from '~/stores/EditorStore';

const EditorTitleInput: Component = () => {
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
        updateCurrentDocument({ title, associatedFilePath: undefined });
      }}
      value={getCurrentDocument()?.title}
    />
  );
};
export default EditorTitleInput;