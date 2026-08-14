import { apiRequest } from "./client";
export async function registerUser(data) {
  return await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });


}

export const loginUser = async (form) => {
  
  return await apiRequest("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    }
  );

};