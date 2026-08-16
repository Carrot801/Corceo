import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getYKey,
  getTotal,
} from "../../utils/chartValueHelpers";
import { formatValue } from "../../utils/formatters";

function AreaChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
  const yKey = getYKey(chartConfig);
  const total = getTotal(chartData, yKey);
  const yKeys = Array.isArray(chartConfig.y)
  ? chartConfig.y
  : chartConfig.y
    ? [chartConfig.y]
    : ["y"];


  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {settings.showGrid !== false && (
            <CartesianGrid strokeDasharray="3 3" />
          )}

          <XAxis
            dataKey="x"
            tick={{ fontSize: settings.labelSize || 12 }}
          />

          <YAxis
            tick={{ fontSize: settings.labelSize || 12 }}
            tickFormatter={(value) =>
              formatValue(value, settings, total)
            }
          />

          <Tooltip
            formatter={(value, name) => [
              formatValue(value, settings),
              name,
            ]}
          />

          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={generatedColors[index] || "#3b82f6"}
              fill={generatedColors[index] || "#3b82f6"}
              fillOpacity={0.25}
              strokeWidth={3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartView;