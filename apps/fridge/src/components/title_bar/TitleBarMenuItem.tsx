import { css } from '@acab/ecsstatic';
import { MenuList, MenuListOption } from '@sledge/ui';
import { Component, createSignal, Show } from 'solid-js';

const root = css`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

const controlLabel = css`
  padding: 4px;
  font-family: ZFB09;
  white-space: nowrap;
  pointer-events: all;
`;

interface Props {
  label: string;
  menu: MenuListOption[];
}

const TitleBarMenuItem: Component<Props> = (props) => {
  const [menuOpen, setMenuOpen] = createSignal(false);

  return (
    <div class={root}>
      <a
        class={controlLabel}
        onClick={async () => {
          setMenuOpen(true);
        }}
        data-tauri-drag-region-exclude
      >
        {props.label}
      </a>

      <Show when={menuOpen()}>
        <MenuList
          options={props.menu}
          closeByOutsideClick={true}
          onClose={() => setMenuOpen(false)}
          style={{
            'margin-top': '-4px',
            width: '120px',
            "border-radius": '4px'
          }}
        />
      </Show>
    </div>
  );
};

export default TitleBarMenuItem;
