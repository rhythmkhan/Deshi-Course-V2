export interface SupabaseLikeError {
  code?: string | null;
  message?: string | null;
  details?: string | null;
}

function readMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return '';
  }

  const maybeError = error as SupabaseLikeError;
  return `${maybeError.message ?? ''} ${maybeError.details ?? ''}`.trim().toLowerCase();
}

export function isMissingRelationError(error: unknown, relation?: string) {
  const maybeError = error as SupabaseLikeError | null | undefined;
  const message = readMessage(error);

  return (
    maybeError?.code === '42P01' ||
    message.includes('relation') &&
      message.includes('does not exist') &&
      (!relation || message.includes(relation.toLowerCase()))
  );
}

export function isMissingColumnError(error: unknown, column?: string) {
  const maybeError = error as SupabaseLikeError | null | undefined;
  const message = readMessage(error);

  return (
    maybeError?.code === '42703' ||
    message.includes('column') &&
      message.includes('does not exist') &&
      (!column || message.includes(column.toLowerCase()))
  );
}

export function isMissingFunctionError(error: unknown, fnName?: string) {
  const maybeError = error as SupabaseLikeError | null | undefined;
  const message = readMessage(error);

  const nameMatch = !fnName || message.includes(fnName.toLowerCase());

  return (
    maybeError?.code === '42883' ||
    (message.includes('function') &&
      message.includes('does not exist') &&
      nameMatch) ||
    (message.includes('could not find the function') && nameMatch)
  );
}

export function isMigrationMissingError(error: unknown) {
  return (
    isMissingRelationError(error) ||
    isMissingColumnError(error) ||
    isMissingFunctionError(error)
  );
}
