import { ImageResponse } from "next/og";
import RegistroMark from "@/components/RegistroMark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080808",
        borderRadius: 14,
      }}
    >
      <RegistroMark size={48} />
    </div>,
    { ...size },
  );
}
