"use client";

import { useEffect, useCallback } from "react";

const GA_MEASUREMENT_ID = "G-20PEN1CVFV";
const CONSENT_KEY = "fwl_cookie_consent";
const CONSENT_EVENT = "cookie-consent-updated";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function getAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const consent = JSON.parse(raw);
    return consent.analytics === true;
  } catch {
    return false;
  }
}

function deleteGACookies() {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("_ga") || name === "_gid") {
      // Delete for current domain and parent domains
      const hostname = window.location.hostname;
      const domains = [hostname, "." + hostname];
      // Add parent domain (e.g. .florencewithlocals.com from forum.florencewithlocals.com)
      const parts = hostname.split(".");
      if (parts.length > 2) {
        domains.push("." + parts.slice(1).join("."));
      }
      for (const domain of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      }
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

function injectGAScripts() {
  // Prevent double-injection
  if (document.getElementById("ga-gtag-script")) return;

  const script = document.createElement("script");
  script.id = "ga-gtag-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function removeGAScripts() {
  const script = document.getElementById("ga-gtag-script");
  if (script) script.remove();

  // Revoke consent and stop sending data
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }

  deleteGACookies();
}

export function GoogleAnalytics() {
  const syncConsent = useCallback(() => {
    if (getAnalyticsConsent()) {
      injectGAScripts();
    } else {
      removeGAScripts();
    }
  }, []);

  useEffect(() => {
    // Check consent on mount
    syncConsent();

    // Listen for consent changes from CookieConsent component
    const handler = () => syncConsent();
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, [syncConsent]);

  return null;
}
