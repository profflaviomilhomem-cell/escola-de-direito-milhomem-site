import { ImageResponse } from "next/og";

/**
 * Apple touch icon dinâmico — 180×180.
 * Mesma família visual do OG: navy profundo, monograma "FM" mostarda
 * com leve cartouche e divisor inferior.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const navy = "#06172F";
  const mostarda = "#DDAD0C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: navy,
          backgroundImage: `radial-gradient(circle at 70% 30%, rgba(221,173,12,0.18) 0%, rgba(221,173,12,0) 60%)`,
          color: mostarda,
          fontSize: 90,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontStyle: "italic",
        }}
      >
        <div style={{ display: "flex", lineHeight: 1 }}>FM</div>
        <div
          style={{
            marginTop: 8,
            width: 36,
            height: 3,
            background: mostarda,
          }}
        />
      </div>
    ),
    size,
  );
}
