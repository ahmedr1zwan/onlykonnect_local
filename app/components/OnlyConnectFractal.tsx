import React from "react";

function polarToCartesian(radius: number, angle: number) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

function createArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const innerStart = polarToCartesian(innerRadius, startAngle);
  const innerEnd = polarToCartesian(innerRadius, endAngle);
  const outerStart = polarToCartesian(outerRadius, startAngle);
  const outerEnd = polarToCartesian(outerRadius, endAngle);

  // SVG arc flags: small arc, sweep = 1 for outer, 0 for inner
  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

const ringConfigs = [
  { inner: 60, outer: 110, segments: 8, rotation: 0 },
  { inner: 115, outer: 165, segments: 10, rotation: Math.PI / 14 },
  { inner: 170, outer: 220, segments: 12, rotation: Math.PI / 8 },
];

const colors = [
  "#e5f0ff",
  "#c6dcff",
  "#a6c6ff",
  "#83a9ff",
  "#628bff",
  "#416dda",
];

export const OnlyConnectFractal: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  return (
    <svg
      className={className}
      viewBox="-230 -230 460 460"
      aria-hidden="true"
    >
      {ringConfigs.map((ring, ringIndex) => {
        const angleStep = (Math.PI * 2) / ring.segments;
        const gapFactor = 0.78; // < 1.0 leaves a gap between segments

        return Array.from({ length: ring.segments }).map((_, i) => {
          const start = ring.rotation + i * angleStep;
          const end = start + angleStep * gapFactor;

          const path = createArcPath(ring.inner, ring.outer, start, end);
          const color = colors[(i + ringIndex * 2) % colors.length];

          return (
            <path
              key={`${ringIndex}-${i}`}
              d={path}
              fill={color}
              // Rounded-ish ends & a subtle shadow feel
              style={{
                strokeLinejoin: "round",
                strokeLinecap: "round",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          );
        });
      })}
    </svg>
  );
};

