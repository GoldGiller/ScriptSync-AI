export function formatApiErrorDetails(details: unknown): string[] {
  if (!details) {
    return [];
  }

  if (Array.isArray(details)) {
    return details.map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const location = Array.isArray(record.loc) ? record.loc.join(' → ') : '';
        const message = typeof record.msg === 'string' ? record.msg : JSON.stringify(record);
        return location ? `${location}: ${message}` : message;
      }

      return String(item);
    });
  }

  if (typeof details === 'string') {
    return [details];
  }

  if (typeof details === 'object') {
    return [JSON.stringify(details)];
  }

  return [String(details)];
}
