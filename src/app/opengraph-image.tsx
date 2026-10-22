import { ImageResponse } from "next/og";
export const alt = "Ask & Explore — Good questions. Better discoveries.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#fafaf8",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "65px 75px",
        color: "#171717",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
        ask<span style={{ color: "#365cf5" }}>&</span>explore.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 80,
          fontFamily: "serif",
          fontSize: 82,
          letterSpacing: -3,
          lineHeight: 1.05,
        }}
      >
        <span>Good questions.</span>
        <span style={{ color: "#365cf5", fontStyle: "italic" }}>
          Better discoveries.
        </span>
      </div>
      <div style={{ fontSize: 19, marginTop: 45, color: "#6f706c" }}>
        Fresh perspectives. Practical answers. Stay curious.
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 170,
          color: "#365cf5",
          fontSize: 230,
          opacity: 0.18,
          fontFamily: "serif",
        }}
      >
        ?
      </div>
    </div>,
    size,
  );
}
