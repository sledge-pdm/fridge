import { css } from '@acab/ecsstatic';

export const titleBarRoot = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
  pointer-events: all;
  background-color: var(--color-background);
  align-items: center;
`;

export const titleBarTitleContainer = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-right: auto;
  padding-left: 24px;
  align-items: center;
`;
export const titleBarTitle = css`
  width: fit-content;
  font-family: k12x8;
  font-size: 8px;
  white-space: pre;
`;

export const titleBarTitleSub = css`
  width: 'fit-content';
  font-family: ZFB03;
  font-size: var(--text-sm);
  white-space: 'pre';
  opacity: 0.5;
`;
export const titleBarLocation = css`
  width: fit-content;
  font-family: ZFB08;
  font-size: 8px;
  white-space: pre;
`;

export const titleBarSaveSection = css`
  display: flex;
  flex-direction: row;
  width: fit-content;
  height: 100%;
  align-items: center;
  margin: 0 12px;
`;
export const titleBarControls = css`
  display: flex;
  flex-direction: row;
`;

export const titleBarControlButtonContainer = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: none;
  height: 36px;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding-left: 16px;
  padding-right: 16px;
  pointer-events: all;
  &:hover {
    background-color: var(--color-button-hover);
  }
`;

export const titleBarControlCloseButtonContainer = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: none;
  height: 36px;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding-left: 16px;
  padding-right: 16px;
  pointer-events: all;
  &:hover {
    background-color: #ff0000b0;
  }
`;

export const titleBarControlButtonImg = css`
  border: none;
  image-rendering: pixelated;
`;
