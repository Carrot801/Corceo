import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { formatValue } from "../../utils/formatters";
import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

function WaterfallChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
  const fields = settings.tooltipFields || ["name", "value"];
  const yKey = getYKey(chartConfig);
  const total = getTotal(chartData, yKey);

  let runningTotal = 0;

  const waterfallData = chartData.map((item, index) => {
    const value = Number(item[yKey]) || 0;
    const start = runningTotal;
    const end = runningTotal + value;

    runningTotal = end;

    return {
      ...item,
      x: item.x,
      y: value,
      [yKey]: value,
      start,
      end,
      base: Math.min(start, end),
      change: Math.abs(value),
      originalValue: value,
      color:
        value >= 0
          ? generatedColors[index] || "#22c55e"
          : "#ef4444",
    };
  });

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={waterfallData}
          margin={{ top: 20, right: 50, left: 40, bottom: 20 }}
        >
          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}

          <XAxis dataKey="x" />

          <YAxis
            tickFormatter={(value) =>
              formatValue(value, settings, total)
            }
          />

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const row = payload[0].payload;

              return (
                <div className="bg-white p-3 border shadow-md rounded text-sm">
                  {fields.includes("name") && (
                    <p className="font-bold">{row.x}</p>
                  )}

                  {fields.includes("value") && (
                    <p>
                      Change:{" "}
                      {formatValue(row.originalValue, settings, total)}
                    </p>
                  )}

                  {fields.includes("percentage") && (
                    <p>
                      Percent:{" "}
                      {getPercent(row.originalValue, total).toFixed(1)}%
                    </p>
                  )}

                  <p>
                    Start: {formatValue(row.start, settings, total)}
                  </p>

                  <p>
                    End: {formatValue(row.end, settings, total)}
                  </p>
                </div>
              );
            }}
          />

          <Bar dataKey="base" stackId="waterfall" fill="transparent" />

          <Bar dataKey="change" stackId="waterfall" radius={[6, 6, 0, 0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WaterfallChartView;