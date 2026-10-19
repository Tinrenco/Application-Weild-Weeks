// Small wrapper around fetch() for calling our API.
// - prefixes every path with the API URL (EXPO_PUBLIC_API_URL, see .env.example);
// - adds the session token when the user is logged in;
// - throws an ApiError when the server answers with an error status.

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

// Set by the SessionProvider after login / logout.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}
