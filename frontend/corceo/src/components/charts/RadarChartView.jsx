import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatValue } from "../../utils/formatters";
import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

function RadarChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {


const yKey = getYKey(chartConfig);
  const total = getTotal(chartData, yKey);

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />

          <PolarAngleAxis dataKey="x" />

          <PolarRadiusAxis
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

          <Radar
            dataKey={yKey}
            stroke={generatedColors[0] || "#3b82f6"}
            fill={generatedColors[0] || "#3b82f6"}
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChartView;