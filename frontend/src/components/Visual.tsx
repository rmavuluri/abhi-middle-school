import type { VisualSpec } from "../types";

const FRAME = "w-full h-64 sm:h-72 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden";

function Frame({ children }: { children: React.ReactNode }) {
  return <div className={FRAME}>{children}</div>;
}

function Label({ x, y, children, anchor = "middle" }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="fill-slate-700 dark:fill-slate-200" style={{ fontSize: 13 }}>
      {children}
    </text>
  );
}

function ShapeVisual({ props }: { props: Record<string, any> }) {
  const shape = props?.shape || "rectangle";
  const unit = props?.unit || "";

  if (shape === "exponent-tower") {
    const base = props?.base ?? 2;
    const exponent = props?.exponent ?? 3;
    const label = props?.label || `${base}^${exponent}`;
    return (
      <Frame>
        <svg viewBox="0 0 300 160" className="w-full h-full p-4">
          <text x="150" y="70" textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-400 font-semibold" style={{ fontSize: 40 }}>
            {base}
            <tspan dy="-18" style={{ fontSize: 22 }}>{exponent}</tspan>
          </text>
          <Label x={150} y={120}>{`= ${label}`}</Label>
        </svg>
      </Frame>
    );
  }

  if (shape === "probability-bag") {
    const items: { color: string; count: number }[] = props?.items || [];
    const total = items.reduce((s, i) => s + i.count, 0);
    let angleStart = 0;
    const r = 55;
    const cx = 90;
    const cy = 90;
    const colorMap: Record<string, string> = { red: "#ef4444", blue: "#3b82f6", green: "#22c55e", yellow: "#eab308" };
    return (
      <Frame>
        <svg viewBox="0 0 300 180" className="w-full h-full p-4">
          {items.map((item, idx) => {
            const frac = item.count / total;
            const angleEnd = angleStart + frac * 2 * Math.PI;
            const x1 = cx + r * Math.cos(angleStart);
            const y1 = cy + r * Math.sin(angleStart);
            const x2 = cx + r * Math.cos(angleEnd);
            const y2 = cy + r * Math.sin(angleEnd);
            const largeArc = frac > 0.5 ? 1 : 0;
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            angleStart = angleEnd;
            return <path key={idx} d={d} fill={colorMap[item.color] || "#999"} opacity={0.85} />;
          })}
          {items.map((item, idx) => (
            <g key={idx} transform={`translate(190, ${30 + idx * 26})`}>
              <rect width="14" height="14" fill={colorMap[item.color] || "#999"} rx={3} />
              <Label x={60} y={11} anchor="start">{`${item.color}: ${item.count}`}</Label>
            </g>
          ))}
        </svg>
      </Frame>
    );
  }

  // rectangle | parallelogram | triangle | rectangle-pair | polygon (default parallelogram-like)
  const base = Number(props?.base ?? 6);
  const height = Number(props?.height ?? 4);
  const scaleMax = Math.max(base, height, 1);
  const px = (v: number) => 20 + (v / scaleMax) * 160;

  if (shape === "rectangle-pair") {
    const scale = Number(props?.scale ?? 2);
    return (
      <Frame>
        <svg viewBox="0 0 320 160" className="w-full h-full p-4">
          <rect x={20} y={40} width={px(base) - 20} height={px(height) - 20} fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
          <Label x={20 + (px(base) - 20) / 2} y={30}>{`${base} ${unit}`}</Label>
          <rect x={160} y={20} width={(px(base) - 20) * scale * 0.5} height={(px(height) - 20) * scale * 0.5} fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth={2} />
          <Label x={160 + ((px(base) - 20) * scale * 0.5) / 2} y={12}>{`${base * scale} ${unit}`}</Label>
        </svg>
      </Frame>
    );
  }

  const bx = px(base);
  const hy = px(height);
  const skew = shape === "parallelogram" ? 30 : 0;

  let points = "";
  if (shape === "triangle") {
    points = `20,${20 + hy - 20} ${20 + bx - 20},${20 + hy - 20} ${20 + (bx - 20) / 2},20`;
  } else if (shape === "parallelogram") {
    points = `${20 + skew},20 ${20 + bx - 20 + skew},20 ${20 + bx - 20},${20 + hy - 20} 20,${20 + hy - 20}`;
  } else {
    points = `20,20 ${20 + bx - 20},20 ${20 + bx - 20},${20 + hy - 20} 20,${20 + hy - 20}`;
  }

  return (
    <Frame>
      <svg viewBox="0 0 220 160" className="w-full h-full p-4">
        {props?.showGrid && (
          <g opacity={0.25}>
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={20 + i * 16} y1={20} x2={20 + i * 16} y2={140} stroke="currentColor" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1={20} y1={20 + i * 16} x2={180} y2={20 + i * 16} stroke="currentColor" strokeWidth={0.5} />
            ))}
          </g>
        )}
        <polygon points={points} fill="currentColor" className="text-indigo-500" opacity={0.25} stroke="currentColor" strokeWidth={2} />
        <Label x={20 + (bx - 20) / 2} y={155}>{`base = ${base} ${unit}`}</Label>
        <Label x={5} y={20 + (hy - 20) / 2} anchor="start">{`h=${height}`}</Label>
      </svg>
    </Frame>
  );
}

function TapeVisual({ props }: { props: Record<string, any> }) {
  const a = Number(props?.a ?? 1);
  const b = Number(props?.b ?? 1);
  const total = a + b;
  const widthA = (a / total) * 260;
  const widthB = (b / total) * 260;
  return (
    <Frame>
      <svg viewBox="0 0 300 120" className="w-full h-full p-4">
        <rect x={20} y={30} width={widthA} height={30} fill="#6366f1" opacity={0.8} rx={4} />
        <rect x={20 + widthA} y={30} width={widthB} height={30} fill="#10b981" opacity={0.8} rx={4} />
        <Label x={20 + widthA / 2} y={78}>{props?.labelA || "A"} ({a})</Label>
        <Label x={20 + widthA + widthB / 2} y={78}>{props?.labelB || "B"} ({b})</Label>
      </svg>
    </Frame>
  );
}

function PercentGridVisual({ props }: { props: Record<string, any> }) {
  const percent = Math.max(0, Math.min(100, Number(props?.percent ?? 50)));
  const shaded = Math.round(percent);
  const cells = Array.from({ length: 100 });
  return (
    <Frame>
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-10 gap-[2px] w-40 sm:w-48">
          {cells.map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-[2px] ${i < shaded ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{percent}% shaded {props?.decreasing ? "(the decrease)" : ""}</p>
      </div>
    </Frame>
  );
}

function FractionBarsVisual({ props }: { props: Record<string, any> }) {
  const whole = Number(props?.whole ?? 3);
  const num = Number(props?.pieceNumerator ?? 1);
  const den = Number(props?.pieceDenominator ?? 2);
  const wholes = Array.from({ length: whole });
  return (
    <Frame>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          {wholes.map((_, w) => (
            <div key={w} className="flex border border-slate-400 rounded overflow-hidden">
              {Array.from({ length: den }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-10 sm:w-7 sm:h-12 border-r border-slate-300 dark:border-slate-600 last:border-r-0 ${i < num ? "bg-amber-400" : "bg-slate-100 dark:bg-slate-700"}`}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{whole} wholes, each split into {den}ths; amber shows groups of {num}/{den}</p>
      </div>
    </Frame>
  );
}

function NumberLineVisual({ props }: { props: Record<string, any> }) {
  const min = -10;
  const max = 10;
  const scaleX = (v: number) => 20 + ((v - min) / (max - min)) * 260;

  const inequality = props?.inequality;
  const start = props?.start;
  const move = props?.move;
  const result = props?.result;

  return (
    <Frame>
      <svg viewBox="0 0 300 100" className="w-full h-full p-4">
        <line x1={20} y1={50} x2={280} y2={50} stroke="currentColor" strokeWidth={2} className="text-slate-400" />
        {Array.from({ length: 21 }).map((_, i) => {
          const v = min + i;
          if (v % 2 !== 0) return null;
          return (
            <g key={v}>
              <line x1={scaleX(v)} y1={45} x2={scaleX(v)} y2={55} stroke="currentColor" className="text-slate-400" />
              <Label x={scaleX(v)} y={70}>{v}</Label>
            </g>
          );
        })}
        {typeof start === "number" && typeof move === "number" && (
          <>
            <circle cx={scaleX(start)} cy={50} r={5} fill="#6366f1" />
            <line
              x1={scaleX(start)}
              y1={30}
              x2={scaleX(start + move)}
              y2={30}
              stroke="#10b981"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
            <circle cx={scaleX(result ?? start + move)} cy={50} r={5} fill="#10b981" />
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#10b981" />
              </marker>
            </defs>
          </>
        )}
        {inequality && (
          <>
            <circle
              cx={scaleX(inequality.value)}
              cy={50}
              r={5}
              fill={inequality.inclusive ? "#6366f1" : "none"}
              stroke="#6366f1"
              strokeWidth={2}
            />
            <line
              x1={scaleX(inequality.value)}
              y1={50}
              x2={inequality.direction === "greater" ? 280 : 20}
              y2={50}
              stroke="#6366f1"
              strokeWidth={3}
            />
          </>
        )}
      </svg>
    </Frame>
  );
}

function CoordinatePlaneVisual({ props }: { props: Record<string, any> }) {
  const points: { x: number; y: number; label?: string }[] = props?.points || [];
  const range = 10;
  const scale = (v: number) => 150 + (v / range) * 130;
  const scaleY = (v: number) => 150 - (v / range) * 130;

  return (
    <Frame>
      <svg viewBox="0 0 300 300" className="w-full h-full p-4">
        <line x1={20} y1={150} x2={280} y2={150} stroke="currentColor" className="text-slate-400" />
        <line x1={150} y1={20} x2={150} y2={280} stroke="currentColor" className="text-slate-400" />
        <Label x={270} y={145} anchor="end">x</Label>
        <Label x={160} y={30}>y</Label>
        {props?.line && points.length >= 2 && (
          <line
            x1={scale(points[0].x)}
            y1={scaleY(points[0].y)}
            x2={scale(points[points.length - 1].x)}
            y2={scaleY(points[points.length - 1].y)}
            stroke="#6366f1"
            strokeWidth={2}
          />
        )}
        {props?.showSlopeTriangle && points.length >= 2 && (
          <g className="text-amber-500">
            <line x1={scale(points[0].x)} y1={scaleY(points[0].y)} x2={scale(points[1].x)} y2={scaleY(points[0].y)} stroke="currentColor" strokeDasharray="4 3" />
            <line x1={scale(points[1].x)} y1={scaleY(points[0].y)} x2={scale(points[1].x)} y2={scaleY(points[1].y)} stroke="currentColor" strokeDasharray="4 3" />
          </g>
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={scale(p.x)} cy={scaleY(p.y)} r={5} fill="#ef4444" />
            <Label x={scale(p.x) + 6} y={scaleY(p.y) - 8} anchor="start">{p.label || `(${p.x}, ${p.y})`}</Label>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

function CircleVisual({ props }: { props: Record<string, any> }) {
  const radius = Number(props?.radius ?? 5);
  const r = 70;
  const unit = props?.unit || "";
  return (
    <Frame>
      <svg viewBox="0 0 220 180" className="w-full h-full p-4">
        <circle cx={110} cy={90} r={r} fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
        <line x1={110} y1={90} x2={110 + r} y2={90} stroke="#ef4444" strokeWidth={2} />
        <Label x={150} y={82}>{`r = ${radius} ${unit}`}</Label>
        {props?.show === "diameter" && (
          <>
            <line x1={110 - r} y1={90} x2={110 + r} y2={90} stroke="#10b981" strokeDasharray="4 3" strokeWidth={1.5} />
            <Label x={110} y={170}>{`diameter = ${radius * 2} ${unit}`}</Label>
          </>
        )}
      </svg>
    </Frame>
  );
}

function AngleVisual({ props }: { props: Record<string, any> }) {
  const angleA = Number(props?.angleA ?? 60);
  const angleB = 180 - angleA;
  const cx = 110;
  const cy = 130;
  const r = 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const p1 = { x: cx - r, y: cy };
  const p2 = { x: cx + r, y: cy };
  const pTop = { x: cx + r * Math.cos(Math.PI - toRad(angleA)), y: cy - r * Math.sin(Math.PI - toRad(angleA)) };
  return (
    <Frame>
      <svg viewBox="0 0 220 160" className="w-full h-full p-4">
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" className="text-slate-400" strokeWidth={2} />
        <line x1={cx} y1={cy} x2={pTop.x} y2={pTop.y} stroke="#6366f1" strokeWidth={2} />
        <Label x={cx - 35} y={cy - 15}>{`${angleA}°`}</Label>
        <Label x={cx + 35} y={cy - 15}>{`${angleB}°`}</Label>
        <Label x={cx} y={150}>{props?.relationship === "supplementary" ? "supplementary angles (sum to 180°)" : "angle relationship"}</Label>
      </svg>
    </Frame>
  );
}

function SolidVisual({ props }: { props: Record<string, any> }) {
  const shape = props?.shape || "cylinder";
  const radius = Number(props?.radius ?? 3);
  const height = Number(props?.height ?? 6);
  const unit = props?.unit || "";
  if (shape === "cone") {
    return (
      <Frame>
        <svg viewBox="0 0 200 180" className="w-full h-full p-4">
          <ellipse cx={100} cy={150} rx={60} ry={18} fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
          <line x1={40} y1={150} x2={100} y2={30} stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
          <line x1={160} y1={150} x2={100} y2={30} stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
          <Label x={100} y={175}>{`r = ${radius} ${unit}`}</Label>
          <Label x={130} y={90} anchor="start">{`h = ${height} ${unit}`}</Label>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <svg viewBox="0 0 200 180" className="w-full h-full p-4">
        <ellipse cx={100} cy={40} rx={60} ry={18} fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
        <line x1={40} y1={40} x2={40} y2={140} stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
        <line x1={160} y1={40} x2={160} y2={140} stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
        <path d="M 40 140 A 60 18 0 0 0 160 140" fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2} />
        <Label x={100} y={170}>{`r = ${radius} ${unit}`}</Label>
        <Label x={175} y={90} anchor="end">{`h = ${height} ${unit}`}</Label>
      </svg>
    </Frame>
  );
}

function PythagorasVisual({ props }: { props: Record<string, any> }) {
  const a = Number(props?.a ?? 3);
  const b = Number(props?.b ?? 4);
  const c = Number(props?.c ?? 5);
  return (
    <Frame>
      <svg viewBox="0 0 220 180" className="w-full h-full p-4">
        <polygon points="40,140 140,140 40,40" fill="#6366f1" opacity={0.15} stroke="#6366f1" strokeWidth={2} />
        <Label x={90} y={155}>{`a = ${a}`}</Label>
        <Label x={20} y={95}>{`b = ${b}`}</Label>
        <Label x={100} y={85}>{`c = ${c}`}</Label>
        <text x={155} y={100} className="fill-slate-600 dark:fill-slate-300" style={{ fontSize: 13 }}>
          a² + b² = c²
        </text>
      </svg>
    </Frame>
  );
}

function DotPlotVisual({ props }: { props: Record<string, any> }) {
  if (props?.scatter) {
    const trend = props?.trend || "positive";
    const points = Array.from({ length: 12 }).map((_, i) => {
      const x = 20 + i * 20 + (Math.random() * 6 - 3);
      const base = trend === "positive" ? i * 10 : 120 - i * 9;
      const y = 150 - base + (Math.random() * 14 - 7);
      return { x, y };
    });
    return (
      <Frame>
        <svg viewBox="0 0 280 170" className="w-full h-full p-4">
          <line x1={20} y1={150} x2={260} y2={150} stroke="currentColor" className="text-slate-400" />
          <line x1={20} y1={20} x2={20} y2={150} stroke="currentColor" className="text-slate-400" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={Math.max(20, Math.min(145, p.y))} r={4} fill="#6366f1" opacity={0.8} />
          ))}
          <Label x={140} y={165}>{trend === "positive" ? "positive association" : "negative association"}</Label>
        </svg>
      </Frame>
    );
  }
  const values: number[] = props?.values || [4, 6, 8, 10, 12];
  const mean = props?.mean;
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const scaleX = (v: number) => 20 + ((v - min) / (max - min)) * 240;
  return (
    <Frame>
      <svg viewBox="0 0 280 120" className="w-full h-full p-4">
        <line x1={20} y1={90} x2={260} y2={90} stroke="currentColor" className="text-slate-400" />
        {values.map((v, i) => (
          <circle key={i} cx={scaleX(v)} cy={80} r={6} fill="#6366f1" opacity={0.85} />
        ))}
        {typeof mean === "number" && (
          <>
            <line x1={scaleX(mean)} y1={95} x2={scaleX(mean)} y2={40} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={2} />
            <Label x={scaleX(mean)} y={30}>{`mean = ${mean}`}</Label>
          </>
        )}
        {values.map((v, i) => (
          <Label key={i} x={scaleX(v)} y={110}>{v}</Label>
        ))}
      </svg>
    </Frame>
  );
}

export default function Visual({ spec }: { spec?: VisualSpec | null }) {
  if (!spec || spec.type === "none") return null;
  const props = spec.props || {};

  switch (spec.type) {
    case "shape":
      return <ShapeVisual props={props} />;
    case "tape":
      return <TapeVisual props={props} />;
    case "percent-grid":
      return <PercentGridVisual props={props} />;
    case "fraction-bars":
      return <FractionBarsVisual props={props} />;
    case "number-line":
      return <NumberLineVisual props={props} />;
    case "coordinate-plane":
      return <CoordinatePlaneVisual props={props} />;
    case "circle":
      return <CircleVisual props={props} />;
    case "angle":
      return <AngleVisual props={props} />;
    case "solid":
      return <SolidVisual props={props} />;
    case "pythagoras":
      return <PythagorasVisual props={props} />;
    case "dot-plot":
      return <DotPlotVisual props={props} />;
    default:
      return null;
  }
}
