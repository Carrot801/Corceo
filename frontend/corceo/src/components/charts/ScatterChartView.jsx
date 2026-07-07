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
import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

function ScatterChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
  

const yKey = getYKey(chartConfig);
const total = getTotal(chartData, yKey);

  const getDynamicWidth = () => {
    if (settings.compactNumbers) return 60;
    if (settings.numberFormat === "currency") return 90;
    return 80;
  };

  const data = chartData.map((item, index) => ({
    ...item,
    xIndex: index + 1,
    xLabel: item.x,
    y: Number(item.y) || 0,
    color: generatedColors[index] || item.color || "#3b82f6",
  }));

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 50, left: 40, bottom: 30 }}>
          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}

          <XAxis
            type="number"
            dataKey="xIndex"
            name="Category"
            tickFormatter={(value) => {
              const item = data[value - 1];
              return item ? item.xLabel : value;
            }}
          />

          <YAxis
            type="number"
            dataKey={yKey}
            name="Value"
            width={getDynamicWidth()}
            tickFormatter={(value) => formatValue(value, settings, total)}
          />

          <ZAxis range={[80, 80]} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const row = payload[0].payload;

                return (
                  <div className="bg-white p-3 border shadow-md rounded text-sm">
                    <p className="font-bold">{row.xLabel}</p>
                    <p>
                      Value: {formatValue(row.y, settings, total)}
                    </p>

                    {settings.tooltipFields?.includes("percentage") && (
                      <p>
                        Percent:{" "}
                        {row.percentage
                          ? row.percentage.toFixed(1)
                          : 0}
                        %
                      </p>
                    )}
                  </div>
                );
              }

              return null;
            }}
          />

          <Scatter data={data} dataKey="y">
            {data.map((entry, index) => (
              <Cell
                key={`scatter-cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScatterChartView;