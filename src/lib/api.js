
export async function api(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" &&
        !["/login", "/signup"].includes(window.location.pathname)) {
      window.location.href = "/login";
    }
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}
