// Premium y alertas SIMULADOS para el prototipo.
// No hay pago real ni envío de alertas: todo se guarda en el localStorage del navegador.

import type { StoreName } from "@/data/products";
import { userKey } from "@/utils/session";

const PREMIUM_KEY = "premiumTrial";
const ALERTS_KEY = "priceAlerts";

export type AlertChannel = "email" | "push" | "whatsapp";
export type AlertFrequency = "immediate" | "daily" | "weekly";

export interface PriceAlert {
  id: string;
  productId: number;
  productName: string;
  /** Avisar cuando el precio final sea menor o igual a este monto. */
  targetPrice: number;
  /** Avisar solo si el descuento real (vs. historial) es al menos este %. */
  minDiscount: number;
  stores: StoreName[];
  channel: AlertChannel;
  frequency: AlertFrequency;
  createdAt: string;
  /** Consentimiento explícito (Ley 29733). */
  consent: true;
}

export const CHANNEL_LABELS: Record<AlertChannel, string> = {
  email: "Correo electrónico",
  push: "Notificación web",
  whatsapp: "WhatsApp",
};

export const FREQUENCY_LABELS: Record<AlertFrequency, string> = {
  immediate: "Apenas cambie el precio",
  daily: "Resumen diario",
  weekly: "Resumen semanal",
};

/** Precio del plan Premium (piloto: el pago no está habilitado). */
export const PREMIUM_MONTHLY_PRICE = 20;

/** Evento para que la interfaz (p. ej. la barra) se actualice al cambiar de plan. */
export const PREMIUM_EVENT = "smartshop:premium-change";

const safeGet = (key: string | null) => {
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string | null, value: string | null) => {
  if (!key) return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento disponible */
  }
};

// Premium y alertas se guardan por usuario (correo). Sin sesión, no hay Premium.
const premiumKey = () => userKey(PREMIUM_KEY);
const alertsKey = () => userKey(ALERTS_KEY);

const notify = () => window.dispatchEvent(new Event(PREMIUM_EVENT));

export const isPremium = () => safeGet(premiumKey()) === "true";

/** Activa una prueba premium simulada (no hay cobro). */
export const activatePremiumTrial = () => {
  safeSet(premiumKey(), "true");
  notify();
};

export const cancelPremiumTrial = () => {
  safeSet(premiumKey(), null);
  notify();
};

export const getAlerts = (): PriceAlert[] => {
  const raw = safeGet(alertsKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveAlert = (alert: Omit<PriceAlert, "id" | "createdAt">): PriceAlert => {
  const full: PriceAlert = {
    ...alert,
    id: `${alert.productId}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  // Una alerta por producto: la nueva reemplaza a la anterior.
  const rest = getAlerts().filter((a) => a.productId !== alert.productId);
  safeSet(alertsKey(), JSON.stringify([full, ...rest]));
  return full;
};

export const deleteAlert = (id: string) => {
  safeSet(alertsKey(), JSON.stringify(getAlerts().filter((a) => a.id !== id)));
};

export const getAlertForProduct = (productId: number) =>
  getAlerts().find((a) => a.productId === productId);
