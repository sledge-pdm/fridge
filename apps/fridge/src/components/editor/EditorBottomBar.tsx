import { Component } from 'solid-js';
import { useActiveDoc } from '~/features/document/useDocuments';
import { flexRow } from '~/styles/styles';

const EditorBottomBar: Component = () => {
  const { activeDoc } = useActiveDoc();

  return (
    <div
      class={flexRow}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '24px',
        'align-items': 'center',
        padding: '0 12px',
        'border-top': `1px solid var(--color-border-secondary)`,
        background: 'var(--color-background)',
      }}
    >
      <p style={{ 'margin-right': 'auto' }}>{activeDoc()?.associatedFilePath || ''}</p>
      <p>{activeDoc()?.content?.length} letters.</p>
    </div>
  );
};

export default EditorBottomBar;
