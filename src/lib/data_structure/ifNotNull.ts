export function ifNotNull<T>(value: T | null): T | undefined {
  return value !== null ? value : undefined;
}
