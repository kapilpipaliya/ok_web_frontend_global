export function getSubDomainRegex(regexp: string) {
  const match = window.location.hostname.match(new RegExp(regexp));
  return match ? match[1] : null;
}
