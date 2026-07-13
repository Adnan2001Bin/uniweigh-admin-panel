/** CSS injected only for in-modal iframe previews (not for print output). */
export const MODAL_PREVIEW_CSS = `
  html {
    container-type: inline-size;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
  }
  body.preview-mode {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2px 0 4px;
    box-sizing: border-box;
  }
  body.preview-mode .page {
    width: 21cm;
    min-height: 29.7cm;
    --preview-scale: min(1, calc((100cqw - 12px) / 21cm));
    transform: scale(var(--preview-scale));
    transform-origin: top center;
    margin-bottom: calc(29.7cm * (var(--preview-scale) - 1));
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
  }
`;

const A4_WIDTH_PX = (21 / 2.54) * 96;
const A4_HEIGHT_PX = (29.7 / 2.54) * 96;

export function getPreviewScale(containerWidthPx: number): number {
  return Math.min(1, Math.max(0, (containerWidthPx - 12) / A4_WIDTH_PX));
}

export function getPreviewIframeHeight(containerWidthPx: number): string {
  const scale = getPreviewScale(containerWidthPx);
  return `${A4_HEIGHT_PX * scale + 16}px`;
}

export function previewBodyClass(autoPrint: boolean): string {
  return autoPrint ? "" : "preview-mode";
}
