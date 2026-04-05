import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MyLunarPhase — Women's Hormone Wellness";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #1a1033 0%, #2d1b4e 40%, #4a2d6e 70%, #6b3fa0 100%)",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Moon glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Stars */}
        {[
          { top: 60, left: 100, size: 4 },
          { top: 120, left: 300, size: 3 },
          { top: 80, left: 800, size: 5 },
          { top: 200, left: 950, size: 3 },
          { top: 400, left: 150, size: 4 },
          { top: 500, left: 700, size: 3 },
          { top: 350, left: 1050, size: 4 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.7)",
              display: "flex",
            }}
          />
        ))}

        {/* Moon icon */}
        <div
          style={{
            fontSize: 72,
            marginBottom: 16,
            display: "flex",
          }}
        >
          🌙
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-1px",
            marginBottom: 8,
            display: "flex",
          }}
        >
          MyLunarPhase
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            opacity: 0.9,
            marginBottom: 32,
            display: "flex",
          }}
        >
          Women&apos;s Hormone Wellness
        </div>

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 20,
            opacity: 0.85,
          }}
        >
          <span style={{ display: "flex" }}>🥗 Nutrition</span>
          <span style={{ display: "flex" }}>💪 Movement</span>
          <span style={{ display: "flex" }}>🌿 Self-Care</span>
          <span style={{ display: "flex" }}>🌙 Moon Wisdom</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
