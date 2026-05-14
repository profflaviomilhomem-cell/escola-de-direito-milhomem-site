"use client";

import { useEffect, useState } from "react";
import { useReportWebVitals } from "next/web-vitals";

/**
 * Coleta Core Web Vitals (CLS, INP, LCP, FCP, TTFB) e envia em
 * `sendBeacon` para `/api/metrics`. O endpoint pode encaminhar para
 * PostHog/GA4 server-side conforme a estratégia do Cap 5.6 do guia.
 *
 * Os dados também são empurrados para o dataLayer com `event: web_vital`
 * para qualquer tag GTM downstream que queira reagir a regressões.
 *
 * A subscrição só monta após o primeiro commit do cliente, para o callback
 * de `useReportWebVitals` não coincidir com a fase em que o React ainda
 * considera componentes por montar (aviso de setState antes do mount).
 */
export function WebVitalsReporter() {
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setClientReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  if (!clientReady) return null;
  return <WebVitalsInner />;
}

function WebVitalsInner() {
  useReportWebVitals((metric) => {
    window.setTimeout(() => {
      const payload = JSON.stringify({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        navigationType: metric.navigationType,
        page: typeof window !== "undefined" ? window.location.pathname : "",
        ts: Date.now(),
      });

      try {
        if (
          typeof navigator !== "undefined" &&
          typeof navigator.sendBeacon === "function"
        ) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/metrics", blob);
        } else {
          void fetch("/api/metrics", {
            method: "POST",
            body: payload,
            headers: { "content-type": "application/json" },
            keepalive: true,
          });
        }
      } catch {
        // best-effort, telemetria não pode quebrar a página
      }

      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
          event: "web_vital",
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
        });
      }
    }, 0);
  });

  return null;
}
