const API_URL = "http://localhost:5000";

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });


  if (!res.ok) {
    throw new Error(
      data.message || "Registration failed"
    );
  }  return res.json();
}

export const loginUser = async (form) => {
  
  const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Login failed"
    );
  }

  return data;
};