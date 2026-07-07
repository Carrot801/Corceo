import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import { formatValue } from "../../utils/formatters";

function ComposedChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
}) {
  const total = chartData.reduce(
    (sum, row) => sum + (Number(row.y) || 0),
    0
  );

  const getDynamicWidth = () => {
    if (settings.compactNumbers) return 60;
    if (settings.numberFormat === "currency") return 90;
    return 80;
  };

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 50, left: 40, bottom: 20 }}
        >
          {settings.showGrid && (
            <CartesianGrid strokeDasharray="3 3" />
          )}

          <XAxis dataKey="x" />

          <YAxis
            width={getDynamicWidth()}
            tickFormatter={(value) =>
              formatValue(value, settings, total)
            }
          />

          <Tooltip
            formatter={(value) => [
              formatValue(value, settings, total),
              "Value",
            ]}
          />

          <Area
            type="monotone"
            dataKey="y"
            fill={generatedColors[0] || "#3b82f6"}
            stroke={generatedColors[0] || "#3b82f6"}
            fillOpacity={0.15}
          />

          <Bar dataKey="y" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={`composed-cell-${index}`}
                fill={generatedColors[index] || "#3b82f6"}
              />
            ))}
          </Bar>

          <Line
            type="monotone"
            dataKey="y"
            stroke={generatedColors[1] || "#ef4444"}
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComposedChartView;