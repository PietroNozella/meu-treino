import { ImageResponse } from "next/og";
import RegistroMark from "@/components/RegistroMark";

export const size = { width: 180, height: 180 };
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
        borderRadius: 40,
      }}
    >
      <RegistroMark size={135} />
    </div>,
    { ...size },
  );
}
