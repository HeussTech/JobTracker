export type Status = "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface Application {
  id: number;
  company: string;
  position: string;
  status: Status;
  url: string | null;
  notes: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface NewApplication {
  company: string;
  position: string;
  status: Status;
  url?: string;
  notes?: string;
}

const TOKEN_KEY = "jobtracker_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string | null) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    setToken(null);
    window.location.reload();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erreur réseau");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) =>
    request<{ token: string }>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  list: (q: string) =>
    request<{ items: Application[]; total: number }>(`/applications?limit=100&q=${encodeURIComponent(q)}`),
  create: (data: NewApplication) =>
    request<Application>("/applications", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<NewApplication>) =>
    request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/applications/${id}`, { method: "DELETE" }),
};
