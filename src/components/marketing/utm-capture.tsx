"use client";

import { useEffect } from "react";

import { UTM_STORAGE_KEY } from "@/lib/orders/utm";

/** Persiste UTM da URL no sessionStorage para associar ao pedido no checkout. */
export function UtmCapture() {
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const utmSource = sp.get("utm_source")?.trim();
    const utmMedium = sp.get("utm_medium")?.trim();
    const utmCampaign = sp.get("utm_campaign")?.trim();

    if (!utmSource && !utmMedium && !utmCampaign) return;

    sessionStorage.setItem(
      UTM_STORAGE_KEY,
      JSON.stringify({
        ...(utmSource ? { utmSource } : {}),
        ...(utmMedium ? { utmMedium } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
      }),
    );
  }, []);

  return null;
}
