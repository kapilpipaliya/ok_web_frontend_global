export function getPlatformModifierKeyLabel() {
  return /Mac|iPhone|iPad/i.test(navigator.platform) ? "Cmd" : "Ctrl";
}
