export function logServerError(context, error) {
  console.error(`[${context}]`, {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    stack: error?.stack,
  });
}
