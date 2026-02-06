import { api } from "../api";

export async function login(email, senha) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: senha,
    }),
  });

  console.log("📥 RESPOSTA LOGIN:", data);

  return data; // { token, user }
}

export async function register({ name, petName, email, password }) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      petName,
      email,
      password,
    }),
  });
}
