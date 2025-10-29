import { css } from '@acab/ecsstatic';

export const newLine = css`
  display: inline-block;
  position: relative;
  width: 0; /* does not consume layout width */
  height: 1em;
  overflow: visible;
  pointer-events: none;
  vertical-align: baseline;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 6px;
    height: 1em;
    transform: translateX(2px);
    background: url('/icons/misc/br.png') left center / 6px 7px no-repeat;
    opacity: 0.45;
  }
`;

export const halfSpace = css`
  opacity: 0.25;
`;

export const fullSpace = css`
  opacity: 0.25;
`;

export const normalText = css`
  opacity: 0;
`;

export const searchHighlight = css`
  background-color: #ff0;
`;
