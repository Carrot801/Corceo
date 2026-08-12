export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";
export async function apiRequest(
  path,
  options = {},
) {
  const {
    auth = true,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const token =
    auth
      ? localStorage.getItem("token")
      : null;

  const headers = {
    ...(fetchOptions.body && {
      "Content-Type":
        "application/json",
    }),

    ...(token && {
      Authorization:
        `Bearer ${token}`,
    }),

    ...customHeaders,
  };

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...fetchOptions,
      headers,
    },
  );

  const data =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ??
      data?.message ??
      `Request failed (${response.status})`,
    );
  }

  return data;
}