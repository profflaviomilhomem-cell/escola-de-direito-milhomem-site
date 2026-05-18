"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { hasAnalyticsConsent } from "@/lib/analytics/consent";

/**
 * Carga client-side de Meta Pixel, LinkedIn Insight Tag e PostHog.
 * Scripts só carregam após consentimento explícito (LGPD).
 */
export function AnalyticsProviders() {
  const { metaPixelId, linkedinPartnerId, posthogKey, posthogHost } =
    siteConfig.tracking;

  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const sync = () => setConsented(hasAnalyticsConsent());
    sync();
    const onConsent = () => sync();
    window.addEventListener("fm-analytics-consent", onConsent);
    return () => window.removeEventListener("fm-analytics-consent", onConsent);
  }, []);

  useEffect(() => {
    if (!consented || !posthogKey) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
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
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [consented, posthogKey, posthogHost]);

  if (!consented) return null;

  return (
    <>
      {metaPixelId ? (
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
      ) : null}

      {linkedinPartnerId ? (
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
      ) : null}
    </>
  );
}
