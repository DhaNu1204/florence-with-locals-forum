"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const CONSENT_KEY = "fwl_cookie_consent";
const CONSENT_EVENT = "cookie-consent-updated";

function dispatchConsentUpdate() {
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setAnalyticsEnabled(parsed.analytics === true);
      } catch {
        setVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, analytics: true, accepted_at: new Date().toISOString() })
    );
    setVisible(false);
    dispatchConsentUpdate();
  };

  const handleReject = () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, analytics: false, accepted_at: new Date().toISOString() })
    );
    setVisible(false);
    dispatchConsentUpdate();
  };

  const handleSaveSettings = () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: analyticsEnabled,
        accepted_at: new Date().toISOString(),
      })
    );
    setShowSettings(false);
    setVisible(false);
    dispatchConsentUpdate();
  };

  const openSettings = () => {
    // Load current state from localStorage when opening settings
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAnalyticsEnabled(parsed.analytics === true);
      }
    } catch {
      // ignore
    }
    setShowSettings(true);
  };

  if (!mounted || !visible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-light-stone bg-white p-4 shadow-lg sm:p-5 overflow-hidden">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-dark-text/70 sm:text-base">
            We use essential cookies to keep you logged in and optional Google
            Analytics cookies to understand how visitors use the forum. Learn
            more in our{" "}
            <Link
              href="/cookie-policy"
              className="font-medium text-terracotta hover:underline"
            >
              Cookie Policy
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              className="sm:w-auto"
              onClick={openSettings}
            >
              Cookie Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              className="sm:w-auto"
              onClick={handleReject}
            >
              Reject
            </Button>
            <Button size="sm" fullWidth className="sm:w-auto" onClick={handleAccept}>
              Accept
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Cookie Settings"
      >
        <div className="space-y-4">
          {/* Essential */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-light-stone p-4">
            <div>
              <p className="text-base font-medium text-dark-text">
                Essential Cookies
              </p>
              <p className="mt-1 text-sm text-dark-text/50">
                Required for authentication and session management. Cannot be
                disabled.
              </p>
            </div>
            <div className="relative h-6 w-11 shrink-0 rounded-full bg-olive-green">
              <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white shadow" />
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-light-stone p-4">
            <div>
              <p className="text-base font-medium text-dark-text">
                Analytics Cookies
              </p>
              <p className="mt-1 text-sm text-dark-text/50">
                Google Analytics &mdash; helps us understand how visitors use the
                forum. Collects anonymous usage data with anonymized IP
                addresses.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analyticsEnabled}
              onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                analyticsEnabled ? "bg-olive-green" : "bg-dark-text/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  analyticsEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
