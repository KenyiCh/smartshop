// Sesión simulada del prototipo (localStorage). Ayuda a guardar datos POR USUARIO.

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  provider?: string;
}

export const getCurrentUser = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
};

/** Clave de localStorage propia del usuario actual (por correo). */
export const userKey = (base: string, email = getCurrentUser()?.email): string | null =>
  email ? `${base}:${email.toLowerCase()}` : null;

const ONBOARDING = "onboardingCompleted";

/** ¿El usuario ya completó (u omitió) el formulario de bienvenida? */
export const hasCompletedOnboarding = (email?: string) => {
  const key = userKey(ONBOARDING, email);
  try {
    return !!key && localStorage.getItem(key) === "true";
  } catch {
    return true;
  }
};

export const markOnboardingCompleted = (email?: string) => {
  const key = userKey(ONBOARDING, email);
  try {
    if (key) localStorage.setItem(key, "true");
  } catch {
    /* sin almacenamiento disponible */
  }
};

/** Ruta a la que se va después de iniciar sesión: el formulario la primera vez. */
export const routeAfterLogin = (email: string, role?: string) =>
  role === "admin" ? "/admin" : hasCompletedOnboarding(email) ? "/" : "/onboarding";
