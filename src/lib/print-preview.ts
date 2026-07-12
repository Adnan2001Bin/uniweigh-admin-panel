/** CSS injected only for in-modal iframe previews (not for print output). */
export const MODAL_PREVIEW_CSS = `
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
    --preview-scale: min(1, calc((100vw - 12px) / 21cm));
    transform: scale(var(--preview-scale));
    transform-origin: top center;
    margin-bottom: calc(29.7cm * (var(--preview-scale) - 1));
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
  }
`;

export function previewBodyClass(autoPrint: boolean): string {
  return autoPrint ? "" : "preview-mode";
}
