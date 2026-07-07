import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { formatValue } from "../../utils/formatters";

function HeatmapChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
  const yKey = Array.isArray(chartConfig?.y)
    ? chartConfig.y[0]
    : chartConfig?.y || "y";

  const total = chartData.reduce(
    (sum, row) => sum + (Number(row[yKey]) || 0),
    0
  );

  const maxValue = Math.max(
    ...chartData.map((item) => Number(item[yKey]) || 0),
    1
  );

  const getPercent = (value) =>
    total ? (Number(value) / total) * 100 : 0;

  const data = chartData.map((item, index) => {
    const value = Number(item[yKey]) || 0;

    return {
      ...item,
      xIndex: index + 1,
      xLabel: item.x,
      yIndex: 1,
      value,
      percentage: getPercent(value),
      color: generatedColors[index] || item.color || "#3b82f6",
    };
  });

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 50, left: 40, bottom: 30 }}>
          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}

          <XAxis
            type="number"
            dataKey="xIndex"
            tickFormatter={(value) => {
              const item = data[value - 1];
              return item ? item.xLabel : value;
            }}
          />

          <YAxis
            type="number"
            dataKey="yIndex"
            hide
            domain={[0, 2]}
          />

          <ZAxis
            type="number"
            dataKey="value"
            range={[300, 1200]}
            domain={[0, maxValue]}
          />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const row = payload[0].payload;

              return (
                <div className="bg-white p-3 border shadow-md rounded text-sm">
                  <p className="font-bold">{row.xLabel}</p>

                  <p>
                    Value: {formatValue(row.value, settings, total)}
                  </p>

                  {settings.tooltipFields?.includes("percentage") && (
                    <p>
                      Percent: {row.percentage.toFixed(1)}%
                    </p>
                  )}
                </div>
              );
            }}
          />

          <Scatter data={data} shape="square">
            {data.map((entry, index) => (
              <Cell
                key={`heatmap-cell-${index}`}
                fill={entry.color}
                fillOpacity={0.35 + (entry.value / maxValue) * 0.65}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HeatmapChartView;