"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import type { LucideIcon } from "lucide-react";

const ACCENT = "#a3e635";
const TRACK = "rgba(128,128,128,0.25)";

interface RadialStatProps {
  label: string;
  value: number;
  max?: number;
  unit: string;
  icon: LucideIcon;
  color?: string;
  formatValue?: (n: number) => string;
  footer?: string;
}

export function RadialStat({
  label,
  value,
  max,
  unit,
  icon: Icon,
  color = ACCENT,
  formatValue = (n) => n.toFixed(0),
  footer,
}: RadialStatProps) {
  const percent = max ? Math.min((value / max) * 100, 100) : value > 0 ? 100 : 0;
  const data = [{ value: percent, fill: color }];

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </div>

      <div className="relative size-28 shrink-0">
        <RadialBarChart
          width={112}
          height={112}
          innerRadius="75%"
          outerRadius="100%"
          barSize={8}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: TRACK }} isAnimationActive={false} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold tabular-nums leading-none">
            {formatValue(value)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            {max ? `/ ${formatValue(max)} ${unit}` : unit}
          </span>
        </div>
      </div>

      {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
    </div>
  );
}
