import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon.
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
          background: "#09090b",
          borderRadius: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 5, height: 26, background: "#34d399", borderRadius: 3 }} />
          <div style={{ width: 8, height: 38, background: "#34d399", borderRadius: 3 }} />
          <div style={{ width: 22, height: 5, background: "#a7f3d0", borderRadius: 3 }} />
          <div style={{ width: 8, height: 38, background: "#34d399", borderRadius: 3 }} />
          <div style={{ width: 5, height: 26, background: "#34d399", borderRadius: 3 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
