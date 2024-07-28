export function removeLastPathSegment() {
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  segments.pop();
  return segments.join("/");
}
