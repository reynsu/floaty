declare const process: { env?: { NODE_ENV?: string } } | undefined;

export function warnDev(message: string): void {
  const env =
    typeof process !== 'undefined' && process && process.env
      ? process.env.NODE_ENV
      : undefined;
  if (env !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[floaty] ${message}`);
  }
}
