import { useEffect } from "react";

/** Trava scroll e sinaliza overlays fixos (newsletter, cookies) para esconder. */
export function useMobileNavLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-fm-mobile-nav-open", "");

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.removeAttribute("data-fm-mobile-nav-open");
    };
  }, [open]);
}
