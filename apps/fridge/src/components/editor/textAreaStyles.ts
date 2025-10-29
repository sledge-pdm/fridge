import { css } from '@acab/ecsstatic';

export const textAreaRoot = css`
  position: relative;
  min-height: 100%;
`;

export const textAreaContentBase = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  background: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  padding: 16px 32px 24px 32px;
  scroll-padding: 16px 32px 24px 32px;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: break-word;

  user-select: all;

  /* テキスト選択時の色 (Firefox用 ::-moz-selection も) */
  &::selection {
    background: var(--color-accent);
    color: var(--color-button-text-on-accent, #000);
  }
`;

export const textAreaContentOverlay = css`
  user-select: none;
  pointer-events: none;
`;
