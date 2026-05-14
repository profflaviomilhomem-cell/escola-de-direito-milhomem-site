"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

type ToasterTheme = "light" | "dark";

function readHtmlTheme(): ToasterTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

/**
 * Envolve a app no cliente para o Sonner acompanhar tema claro/escuro
 * (classes em `<html>` alteradas pela barra de acessibilidade).
 */
export function ClientProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [toasterTheme, setToasterTheme] = useState<ToasterTheme>(() =>
    readHtmlTheme(),
  );

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      window.setTimeout(() => {
        setToasterTheme(readHtmlTheme());
      }, 0);
    });
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors theme={toasterTheme} />
    </>
  );
}
