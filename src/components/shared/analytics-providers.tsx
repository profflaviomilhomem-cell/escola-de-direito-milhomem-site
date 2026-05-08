"use client";

import Script from "next/script";
import { useEffect } from "react";

import { siteConfig } from "@/config/site";

/**
 * Carga client-side de Meta Pixel, LinkedIn Insight Tag e PostHog.
 *
 * Cada bloco é gated pelo ID correspondente em `siteConfig.tracking`:
 * sem ID, nada é renderizado e nenhum script externo é carregado.
 *
 * GTM já vem do `app/layout.tsx` via `@next/third-parties/google` —
 * não duplicado aqui.
 */
export function AnalyticsProviders() {
  const { metaPixelId, linkedinPartnerId, posthogKey, posthogHost } =
    siteConfig.tracking;

  useEffect(() => {
    if (!posthogKey) return;
    let cancelled = false;
    void import("posthog-js").then((mod) => {
      if (cancelled) return;
      const ph = mod.default;
      if (ph.__loaded) return;
      ph.init(posthogKey, {
        api_host: posthogHost,
        defaults: "2025-05-24",
        capture_pageview: true,
        capture_pageleave: true,
        person_profiles: "identified_only",
      });
    });
    return () => {
      cancelled = true;
    };
  }, [posthogKey, posthogHost]);

  return (
    <>
      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {linkedinPartnerId && (
        <>
          <Script id="linkedin-insight" strategy="afterInteractive">
            {`
              _linkedin_partner_id = "${linkedinPartnerId}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
              })(window.lintrk);
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://px.ads.linkedin.com/collect/?pid=${linkedinPartnerId}&fmt=gif`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
