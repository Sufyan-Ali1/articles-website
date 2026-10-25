import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const alt = "Ask & Explore — Discover more. Learn every day.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const mark = await readFile(
    path.join(process.cwd(), "public/images/brand/ae-mark.svg"),
  );
  const markUrl = `data:image/svg+xml;base64,${mark.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(125deg, #f8fbff 0%, #ffffff 55%, #e7f8f3 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "65px 75px",
        color: "#041b3a",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        {/* ImageResponse renders plain image elements rather than next/image. */}
        <img src={markUrl} width={90} height={49} alt="" />
        <span style={{ display: "flex", gap: 8 }}>
          Ask &amp; <span style={{ color: "#008be9" }}>Explore</span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 90,
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -3,
          lineHeight: 1.05,
        }}
      >
        <span>Discover more.</span>
        <span style={{ color: "#0562f5" }}>Learn every day.</span>
      </div>
      <div style={{ fontSize: 24, marginTop: 35, color: "#607594" }}>
        Clear answers for curious minds.
      </div>
      <div
        style={{
          position: "absolute",
          right: 65,
          top: 245,
          display: "flex",
          opacity: 0.1,
        }}
      >
        <img src={markUrl} width={330} height={178} alt="" />
      </div>
    </div>,
    size,
  );
}
