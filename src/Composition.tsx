import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  ink: "#263238",
  muted: "#68767c",
  line: "#68767c",
  queue: "#fff0d6",
  queueStroke: "#d8a955",
  producer: "#f9e5e2",
  consumer: "#e7eef8",
  A: "#55b8e7",
  B: "#64c68b",
  C: "#f0b945",
  D: "#9c77d5",
  green: "#26965f",
  red: "#d35e52",
  track: "#e5e9eb",
};

type Tenant = "A" | "B" | "C" | "D";
const tenantColor = (t: Tenant) => palette[t];
const ease = (f: number, input: [number, number], output: [number, number]) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Message: React.FC<{ x: number; y: number; tenant: Tenant; r?: number; opacity?: number }> = ({
  x, y, tenant, r = 21, opacity = 1,
}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={tenantColor(tenant)} stroke="#ffffff" strokeWidth={2.5} />
    <text x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill="white">{tenant}</text>
  </g>
);

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string }> = ({ x1, y1, x2, y2, color = palette.line }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} markerEnd="url(#arrow)" />
);

const ProducerPanel: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={75} y={y} width={165} height={265} rx={8} fill={palette.producer} stroke="#d7b4b0" />
    <text x={157} y={y + 27} textAnchor="middle" fontSize={16} fontWeight={700} fill={palette.ink}>Producers</text>
    {(["A", "B", "C", "D"] as Tenant[]).map((t, i) => {
      const cy = y + 75 + i * 52;
      return <g key={t}>
        <text x={94} y={cy + 5} textAnchor="start" fontSize={14} fill={palette.muted}>Tenant {t}</text>
        <Message x={203} y={cy} tenant={t} r={20} />
      </g>;
    })}
  </g>
);

type SceneMode = "steady" | "impact" | "mitigation";

const ConsumerPanel: React.FC<{ y: number; mode: SceneMode; frame: number }> = ({ y, mode, frame }) => {
  const quietArrivalCycle = 660 / 2.8;
  const quietTenantArrivals = ([
    { tenant: "B" as Tenant, first: (660 - (524 - 320)) / 2.8 },
    { tenant: "C" as Tenant, first: (660 - (704 - 320)) / 2.8 },
    { tenant: "D" as Tenant, first: (660 - (884 - 320)) / 2.8 },
  ]).map(({ tenant, first }) => {
    const cycle = Math.floor((frame - 180 - first) / quietArrivalCycle);
    return { tenant, arrivalFrame: cycle >= 0 ? 180 + first + cycle * quietArrivalCycle : -1 };
  }).filter(({ arrivalFrame }) => arrivalFrame >= 0)
    .sort((a, b) => b.arrivalFrame - a.arrivalFrame);
  const slots: Tenant[] = mode === "impact"
    ? [...Array.from({ length: 12 }, () => "A" as Tenant), ...(quietTenantArrivals[0] ? [quietTenantArrivals[0].tenant] : [])]
    : mode === "mitigation"
      ? ["B", "C", "D", "B", "C", "D", "A", "B", "C", "D", "A", "A"]
      : ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"];
  return <g>
    <rect x={1040} y={y} width={165} height={mode === "impact" ? 300 : 265} rx={8} fill={palette.consumer} stroke="#bdcadb" />
    <text x={1122} y={y + 27} textAnchor="middle" fontSize={16} fontWeight={700} fill={palette.ink}>Consumers</text>
    {slots.map((t, i) => <Message
      key={t + "-" + i}
      x={1080 + (i % 3) * 42}
      y={y + 68 + Math.floor(i / 3) * (mode === "impact" ? 40 : 43)}
      tenant={t}
      r={16}
    />)}
    {mode === "mitigation" && <text x={1122} y={y + 250} textAnchor="middle" fontSize={12} fontWeight={700} fill={palette.green}>quiet tenants prioritized</text>}
  </g>;
};

const DwellStrip: React.FC<{ frame: number; mode: SceneMode }> = ({ frame, mode }) => {
  const impactProgress = interpolate(frame, [180, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mitigationProgress = interpolate(frame, [480, 720], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <g>
    <text x={88} y={585} fontSize={17} fontWeight={700} fill={palette.ink}>Dwell time</text>
    {(["A", "B", "C", "D"] as Tenant[]).map((t, i) => {
      const x = 300 + i * 202;
      const width = mode === "steady"
        ? 52
        : mode === "impact"
          ? 52 + impactProgress * 78
          : i === 0
            ? 138
            : 130 - mitigationProgress * 78;
      const barColor = mode === "steady"
        ? palette.green
        : mode === "impact"
          ? interpolateColors(impactProgress, [0, 1], [palette.green, palette.red])
          : i === 0
            ? palette.red
            : interpolateColors(mitigationProgress, [0, 1], [palette.red, palette.green]);
      return <g key={t}>
        <circle cx={x} cy={615} r={14} fill={tenantColor(t)} />
        <text x={x} y={620} textAnchor="middle" fontSize={12} fontWeight={700} fill="white">{t}</text>
        <rect x={x + 25} y={605} width={150} height={20} rx={10} fill={palette.track} />
        <rect x={x + 25} y={605} width={width} height={20} rx={10} fill={barColor} />
      </g>;
    })}
    <text x={1110} y={585} textAnchor="end" fontSize={13} fill={palette.muted}>
      {mode === "impact" ? "higher for everyone" : mode === "mitigation" ? "A stays high · B, C, D stay low" : "low across tenants"}
    </text>
  </g>;
};

const NoisyNeighborPrototype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const steady = seconds < 6;
  const mode: SceneMode = steady ? "steady" : seconds < 16 ? "impact" : "mitigation";
  const caption = seconds < 6
    ? "Messages from four tenants share one standard queue."
    : seconds < 16
      ? "Tenant A floods the queue. Workers are occupied with A’s messages."
      : "SQS prioritizes B, C and D; their dwell stays low while A’s backlog drains.";
  const title = seconds < 6
    ? "Steady state"
    : seconds < 16
      ? "Noisy neighbor impact"
      : "Mitigation with fair queues";
  const quietOpacity = mode === "mitigation" ? ease(frame, [480, 525], [0.45, 1]) : 1;
  const queueY = 243;
  const queueTop = queueY + 50;
  const messages: { tenant: Tenant; x: number }[] = steady
    ? [
        { tenant: "A", x: 354 }, { tenant: "B", x: 416 }, { tenant: "C", x: 478 },
        { tenant: "D", x: 540 }, { tenant: "A", x: 602 }, { tenant: "B", x: 664 },
        { tenant: "C", x: 726 }, { tenant: "D", x: 788 }, { tenant: "A", x: 850 },
      ]
    : mode === "mitigation"
      ? [
          ...Array.from({ length: 18 }, (_, i) => ({ tenant: "A" as Tenant, x: 350 + i * (620 / 17) })),
          { tenant: "B", x: 390 }, { tenant: "C", x: 610 }, { tenant: "D", x: 830 },
        ]
      : [
        ...(["A", "A", "A", "A", "A", "B", "A", "A", "A", "A", "C", "A", "A", "A", "A", "D", "A", "A"] as Tenant[])
          .map((tenant, i) => ({ tenant, x: 344 + i * 36 })),
      ];
  const wrap = (value: number, length: number) => ((value % length) + length) % length;
  const messageX = (tenant: Tenant, baseX: number) => {
    if (mode === "steady") {
      return 320 + wrap(baseX - 320 + frame * 2.8, 650);
    }
    if (mode === "impact") {
      return 320 + wrap(baseX - 320 + (frame - 180) * 2.8, 660);
    }
    if (mode === "mitigation" && tenant === "A") {
      // A's backlog drains slowly while the fair-queue tenants overtake it.
      return 320 + wrap(baseX - 320 + (frame - 480) * 0.55, 660);
    }
    if (mode === "mitigation" && tenant !== "A") {
      // Quiet tenant messages travel the same queue lane and overtake A's slower backlog.
      return 320 + wrap(baseX - 320 + (frame - 480) * 3.2, 660);
    }
    return baseX;
  };

  return <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
    <svg width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={palette.line} />
        </marker>
        <filter id="softShadow" x="-10%" y="-20%" width="120%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#a77e38" floodOpacity="0.16" />
        </filter>
      </defs>
      <text x={78} y={55} fontSize={15} fontWeight={700} letterSpacing={2.5} fill="#69767c">AMAZON SQS · FAIR QUEUES</text>
      <text x={78} y={110} fontSize={43} fontWeight={700} letterSpacing={-1.4} fill={palette.ink}>{title}</text>
      <line x1={78} y1={132} x2={1202} y2={132} stroke="#e5e9eb" />
      <text x={78} y={169} fontSize={18} fill={palette.muted}>
        {steady ? "A shared queue can serve many logical tenants." : "A noisy tenant can create a backlog that holds up its neighbors."}
      </text>

      <ProducerPanel y={queueY} />
      <ConsumerPanel y={queueY} mode={mode} frame={frame} />
      <g>
        <rect x={265} y={queueTop} width={750} height={165} rx={74} fill={palette.queue} stroke={palette.queueStroke} strokeWidth={2} filter="url(#softShadow)" />
        <ellipse cx={280} cy={queueTop + 82} rx={18} ry={82} fill="#ffdfa8" stroke={palette.queueStroke} strokeWidth={2} />
        <ellipse cx={1000} cy={queueTop + 82} rx={18} ry={82} fill="#ffe9c5" stroke={palette.queueStroke} strokeWidth={2} />
        <text x={640} y={queueTop + 26} textAnchor="middle" fontSize={15} fontWeight={700} fill={palette.ink}>
          Queue backlog
        </text>
        {messages.map((m, i) => <Message
          key={m.tenant + "-" + i}
          x={messageX(m.tenant, m.x)}
          y={queueTop + (mode === "mitigation" ? 91 : 91 + (i % 2) * 2)}
          tenant={m.tenant}
          r={20}
          opacity={m.tenant === "A" || steady ? 1 : quietOpacity}
        />)}
      </g>

      <Arrow x1={240} y1={queueTop + 82} x2={260} y2={queueTop + 82} />
      <Arrow x1={1018} y1={queueTop + 82} x2={1038} y2={queueTop + 82} color={mode === "mitigation" ? palette.green : palette.line} />
      <DwellStrip frame={frame} mode={mode} />
      <rect x={78} y={655} width={1124} height={3} rx={2} fill="#e8ecee" />
      <rect x={78} y={655} width={1124 * Math.min(1, seconds / 25)} height={3} rx={2} fill="#e89b28" />
      <text x={640} y={698} textAnchor="middle" fontSize={19} fill={palette.ink}>{caption}</text>
      <text x={1202} y={42} textAnchor="end" fontSize={12} fill="#839096">CONCEPTUAL DIAGRAM</text>
    </svg>
  </AbsoluteFill>;
};

export const Video = () => <NoisyNeighborPrototype />;

export const MyComposition = () => (
  <Composition id="NoisyNeighborPrototype" component={Video} durationInFrames={750} fps={30} width={1280} height={720} />
);
