// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createUUID(_title?: string): string {
  return crypto.randomUUID()
}
