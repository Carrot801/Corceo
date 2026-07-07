import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { formatValue } from "../../utils/formatters";

function BarChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
  const yKeys = Array.isArray(chartConfig.y)
    ? chartConfig.y
    : chartConfig.y
      ? [chartConfig.y]
      : ["y"];

  const getDynamicWidth = () => {
    if (settings.compactNumbers) return 60;
    if (settings.numberFormat === "currency") return 90;
    return 80;
  };

  const total = chartData.reduce((sum, row) => {
    return (
      sum +
      yKeys.reduce(
        (innerSum, key) => innerSum + (Number(row[key]) || 0),
        0
      )
    );
  }, 0);

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 50, left: 40, bottom: 25 }}
        >
          {settings.showGrid && (
            <CartesianGrid strokeDasharray="3 3" />
          )}

          <XAxis dataKey="x" />

          <YAxis
            tickFormatter={(value) =>
              formatValue(value, settings, total)
            }
            width={getDynamicWidth()}
          />

          <Tooltip
            formatter={(value, name) => [
              formatValue(value, settings, total),
              name,
            ]}
          />

          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              radius={[6, 6, 0, 0]}
              fill={generatedColors[index] || "#3b82f6"}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartView;