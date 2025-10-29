import { css } from '@acab/ecsstatic';

export const editorContentEditable = css`
  width: 100%;
  height: 100%;
  inset: 0;
  background: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  padding: 16px 32px 24px 32px;
  scroll-padding: 16px 32px 24px 32px;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: break-word;

  &::-webkit-scrollbar {
    width: 2px;
    background-color: transparent;
  }
  &::-webkit-thumb {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #888;
  }

  /* テキスト選択時の色 (Firefox用 ::-moz-selection も) */
  &::selection {
    background: var(--color-accent);
    color: var(--color-button-text-on-accent, #000);
  }

  & h1 {
    font-family: ZFB09;
    font-size: 24px;
    font-weight: normal;
  }

  & h2 {
    font-family: ZFB09;
    font-size: 8px;
    font-weight: normal;
  }

  & h3 {
    font-family: ZFB08;
    font-size: 8px;
    font-weight: normal;
  }

  & h4 {
    font-family: ZFB08;
    font-size: 8px;
    font-weight: normal;
  }

  & p {
    font-family: PM12;
    font-size: 12px;
  }
`;
