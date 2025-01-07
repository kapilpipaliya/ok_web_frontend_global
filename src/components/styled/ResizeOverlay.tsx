import { Portal } from "solid-js/web";

export function ResizeOverlay() {
  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          'z-index': '9999'
        }} />
    </Portal>
  );
}
