import { createHash, randomBytes } from "node:crypto";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { env } from "./env.server";

const SESSION_COOKIE_BASE = "loyalty-session";
const REFRESH_COOKIE_BASE = "loyalty-refresh";
const ACCESS_SESSION_TTL_SECONDS = 60 * 15;
const REFRESH_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getSessionCookieName() {
  return env.isProduction
    ? "__Host-loyalty-session"
    : SESSION_COOKIE_BASE;
}

export function getRefreshCookieName() {
  return env.isProduction
    ? "__Host-loyalty-refresh"
    : REFRESH_COOKIE_BASE;
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readCookieValue(cookieName: string) {
  const cookieHeader = getRequestHeader("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(/;\s*/)) {
    const eqIndex = part.indexOf("=");
    if (eqIndex <= 0) continue;
    const name = part.slice(0, eqIndex);
    if (name === cookieName) {
      return part.slice(eqIndex + 1);
    }
  }

  return null;
}

function buildCookie(cookieName: string, value: string, maxAgeSeconds: number) {
  const parts = [
    `${cookieName}=${value}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (env.isProduction) {
    parts.splice(1, 0, "Secure");
  }

  return parts.join("; ");
}

function setCookie(cookieValue: string | string[]) {
  setResponseHeader("Set-Cookie", cookieValue);
}

export function setSessionCookie(token: string) {
  setCookie(buildCookie(getSessionCookieName(), token, ACCESS_SESSION_TTL_SECONDS));
}

export function clearSessionCookie() {
  setCookie(buildCookie(getSessionCookieName(), "", 0));
}

export function setRefreshCookie(token: string) {
  setCookie(buildCookie(getRefreshCookieName(), token, REFRESH_SESSION_TTL_SECONDS));
}

export function clearRefreshCookie() {
  setCookie(buildCookie(getRefreshCookieName(), "", 0));
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  setCookie([
    buildCookie(getSessionCookieName(), accessToken, ACCESS_SESSION_TTL_SECONDS),
    buildCookie(getRefreshCookieName(), refreshToken, REFRESH_SESSION_TTL_SECONDS),
  ]);
}

export function clearAuthCookies() {
  setCookie([
    buildCookie(getSessionCookieName(), "", 0),
    buildCookie(getRefreshCookieName(), "", 0),
  ]);
}
