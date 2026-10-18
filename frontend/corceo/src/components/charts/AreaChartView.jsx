import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";

function AreaChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
  visibleYKeys,
  fullChartTotal,
  storyMode = false,
  exportMode = false,
}) {
  const yKeys =
    visibleYKeys ??
    (
      Array.isArray(chartConfig.y)
        ? chartConfig.y
        : chartConfig.y
          ? [chartConfig.y]
          : ["y"]
    );

  const total =
    fullChartTotal ??
    chartData.reduce(
      (sum, row) =>
        sum +
        yKeys.reduce(
          (seriesSum, key) =>
            seriesSum + (Number(row[key]) || 0),
          0
        ),
      0
    );

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {settings.showGrid !== false && (
            <CartesianGrid strokeDasharray="3 3" />
          )}

          <XAxis
            dataKey="x"
            tick={{
              fontSize: settings.labelSize || 12,
            }}
          />

          <YAxis
            tick={{
              fontSize: settings.labelSize || 12,
            }}
            tickFormatter={(value) =>
              formatValue(value, settings, total)
            }
          />

          {settings.showTooltip !== false && !exportMode && (
            <Tooltip
              allowEscapeViewBox={{
                x: false,
                y: false,
              }}
              isAnimationActive={false}
              wrapperStyle={{
                zIndex: 999999,
                pointerEvents: "none",
              }}
              formatter={(value, name) => [
                formatValue(value, settings, total),
                name,
              ]}
              content={
                <CustomChartTooltip
                  settings={settings}
                  total={total}
                  storyMode={storyMode}
                />
              }
            />
          )}

          {yKeys.map((key, index) => {
            const color =
              generatedColors[
                index % Math.max(generatedColors.length, 1)
              ] || "#3b82f6";

            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                isAnimationActive={false}
                stroke={color}
                fill={color}
                fillOpacity={0.5}
                strokeWidth={3}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartView;