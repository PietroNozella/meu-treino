import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícone da Tela de Início do iPhone (apple-touch-icon).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          borderRadius: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 72, background: "#34d399", borderRadius: 7 }} />
          <div style={{ width: 22, height: 104, background: "#34d399", borderRadius: 8 }} />
          <div style={{ width: 60, height: 14, background: "#a7f3d0", borderRadius: 7 }} />
          <div style={{ width: 22, height: 104, background: "#34d399", borderRadius: 8 }} />
          <div style={{ width: 14, height: 72, background: "#34d399", borderRadius: 7 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
