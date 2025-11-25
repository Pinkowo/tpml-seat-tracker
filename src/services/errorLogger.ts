export const errorLogger = {
  info: (...args: unknown[]) => {
    console.info('[App]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[App Warning]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[App Error]', ...args);
  }
};

export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  errorLogger.error('Captured error', { error, context });
};
