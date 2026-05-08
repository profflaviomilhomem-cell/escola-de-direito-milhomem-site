import { ImageResponse } from "next/og";

/**
 * Favicon dinâmico — 32×32.
 * Substitui o `favicon.ico` placeholder. Monograma "F" em mostarda
 * sobre fundo navy.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06172F",
          color: "#DDAD0C",
          fontSize: 22,
          fontWeight: 700,
          fontStyle: "italic",
          letterSpacing: "-0.05em",
        }}
      >
        F
      </div>
    ),
    size,
  );
}
