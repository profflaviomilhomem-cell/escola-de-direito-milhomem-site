import { ImageResponse } from "next/og";

import { getBlogPostMeta } from "@/lib/blog/content";
import { DB_CATEGORY_LABEL } from "@/lib/blog/prisma-posts";

export const runtime = "edge";
export const alt = "Escola Flávio Milhomem — Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { params: Promise<{ slug: string }> };

const CATEGORY_LABEL: Record<string, string> = {
  ...DB_CATEGORY_LABEL,
  "analise-decisao": "Análise de decisão",
  "dogmatica-aplicada": "Dogmática aplicada",
  "comentario-atual": "Comentário atual",
};

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPostMeta(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#030024",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e6c35c",
            fontSize: 60,
            fontWeight: "bold",
          }}
        >
          Escola Flávio Milhomem
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#030024",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            background: "#e6c35c",
            borderRadius: "50%",
            opacity: 0.1,
            filter: "blur(80px)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <p
            style={{
              color: "#e6c35c",
              fontSize: 24,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 32,
            }}
          >
            {CATEGORY_LABEL[post.category] || "Artigo"}
          </p>
          <h1
            style={{
              color: "#fcfaf2",
              fontSize: 72,
              lineHeight: 1.1,
              fontWeight: "bold",
              margin: 0,
              maxWidth: 900,
            }}
          >
            {post.title}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(230, 195, 92, 0.2)",
            paddingTop: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 60,
                height: 60,
                background: "#e6c35c",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "#030024",
                fontWeight: "bold",
                marginRight: 20,
              }}
            >
              FM
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{ color: "#fcfaf2", fontSize: 24, fontWeight: "bold" }}
              >
                Flávio Milhomem
              </span>
              <span
                style={{
                  color: "rgba(252, 250, 242, 0.6)",
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Professor de Direito Penal
              </span>
            </div>
          </div>
          <div
            style={{
              color: "#e6c35c",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: "0.1em",
            }}
          >
            ESCOLAFLAVIOMILHOMEM.COM.BR
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
