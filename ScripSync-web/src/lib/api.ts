const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

interface ApiErrorPayload {
  success?: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;

  constructor(message: string, options?: { code?: string; details?: unknown; status?: number }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.details = options?.details;
    this.status = options?.status;
  }
}

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseApiResponse<TResponse>(response: Response): Promise<TResponse> {
  let body: TResponse | ApiErrorPayload | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorBody = body as ApiErrorPayload | null;
    throw new ApiError(
      errorBody?.error?.message || errorBody?.message || `请求失败（${response.status}）`,
      {
        code: errorBody?.error?.code,
        details: errorBody?.error?.details,
        status: response.status,
      }
    );
  }

  return body as TResponse;
}

export async function postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<TResponse>(response);
}

export async function postFormData<TResponse>(path: string, payload: FormData): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    body: payload,
  });

  return parseApiResponse<TResponse>(response);
}
