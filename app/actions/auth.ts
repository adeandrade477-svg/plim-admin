"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
const SESSION_COOKIE = "plim_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export interface Session {
  token: string;
  usermane: string;
  profileId: number;
  profileName: string;
}

export async function login(usermane: string, password: string) {
  const res = await fetch(`${API_URL}/admin/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usermane, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.message || "Usuário ou senha inválidos";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  const loginData = await res.json();

  // Busca o nome do perfil
  let profileName = `Perfil ${loginData.profileId}`;
  try {
    const profilesRes = await fetch(`${API_URL}/admin/profile/fetch`);
    if (profilesRes.ok) {
      const profiles: { id: number; name: string }[] = await profilesRes.json();
      const found = profiles.find((p) => p.id === loginData.profileId);
      if (found) profileName = found.name;
    }
  } catch {
    // mantém o fallback
  }

  const session: Session = { ...loginData, profileName };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
