export function isValidResponse(res: any) {
  return !res.error && res.statusCode !== 500;
}
