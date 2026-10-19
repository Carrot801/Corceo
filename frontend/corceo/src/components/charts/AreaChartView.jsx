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
  const appearance = chartConfig.appearance ?? {};

const areaMode = appearance.areaMode ?? "normal";

const curveType =
  {
    smooth: "monotone",
    linear: "linear",
    step: "step",
  }[appearance.lineStyle ?? "smooth"] ?? "monotone";

const showPoints =
  appearance.showPoints !== false &&
  (appearance.pointSize ?? 4) > 0;
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
  stackOffset={areaMode === "percent" ? "expand" : "none"}
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
            domain={
  areaMode === "percent"
    ? [0, 1]
    : ["auto", "auto"]
}
tickFormatter={(value) =>
  areaMode === "percent"
    ? `${Math.round(Number(value) * 100)}%`
    : formatValue(value, settings, total)
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
  type={curveType}
  dataKey={key}
  name={key}
  stackId={areaMode === "normal" ? undefined : "area-stack"}
  isAnimationActive={false}
  stroke={color}
  fill={color}
  fillOpacity={appearance.fillOpacity ?? 0.3}
  strokeWidth={appearance.lineWidth ?? 3}
  opacity={appearance.opacity ?? 1}
  connectNulls={appearance.connectNulls ?? false}
  dot={
    showPoints
      ? {
          r: appearance.pointSize ?? 4,
          fill: color,
          stroke: color,
        }
      : false
  }
  activeDot={
    showPoints
      ? {
          r: (appearance.pointSize ?? 4) + 2,
        }
      : false
  }
/>
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartView;