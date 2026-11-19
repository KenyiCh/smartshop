import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { formatPrice } from "@/utils/priceUtils";
import type { PricePoint } from "@/data/products";

interface PriceChartProps {
  data: PricePoint[];
}

const RANGES = {
  "1m": { label: "Último mes", weeks: 5 },
  "3m": { label: "Últimos 3 meses", weeks: 14 },
} as const;

type Range = keyof typeof RANGES;

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

const PriceChart = ({ data }: PriceChartProps) => {
  const [range, setRange] = useState<Range>("3m");
  const shown = data.slice(-RANGES[range].weeks).map((p) => ({ ...p, label: shortDate(p.date) }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="text-lg font-semibold">Mejor precio por semana</h3>
        <Select value={range} onValueChange={(v: Range) => setRange(v)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RANGES).map(([k, r]) => (
              <SelectItem key={k} value={k}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={shown} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              domain={["dataMin - 100", "dataMax + 100"]}
              tickFormatter={(v) => `S/ ${formatPrice(Math.round(Number(v)))}`}
              width={80}
            />
            <Tooltip
              formatter={(value) => [`S/ ${formatPrice(Number(value))}`, "Mejor precio"]}
              labelFormatter={(label) => `Semana del ${label}`}
            />
            <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
