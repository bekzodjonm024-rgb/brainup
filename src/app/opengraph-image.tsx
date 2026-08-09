import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BrainUP — Adaptiv o'qish platformasi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #312e81 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Dot grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Logo circle */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 900, color: "#1e40af" }}>B</div>
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          Brain<span style={{ color: "#60a5fa" }}>UP</span>
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginTop: 16,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Adaptiv o&apos;qish platformasi
        </div>
        {/* Partner */}
        <div
          style={{
            fontSize: 20,
            color: "#475569",
            marginTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 20,
          }}
        >
          NamDPI hamkorligida · Namangan Davlat Pedagogika Instituti
        </div>
      </div>
    ),
    { ...size }
  );
}
