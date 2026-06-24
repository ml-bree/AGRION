import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinancialYieldBlock } from "./types";

interface Props {
  block: FinancialYieldBlock;
}

export function FinancialYieldChart({ block }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-soil">
        {block.crop} — yield &amp; revenue
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={block.points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="yield" name="Yield" fill="#1f7a3d" />
          <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#e8c44d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
