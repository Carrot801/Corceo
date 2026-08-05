import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";

import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";

import {
  getTotal,
} from "../../utils/chartValueHelpers";

function ConditionalRadarDot({
  cx,
  cy,
  payload,
  dataKey,
  fallbackColor,
  settings,
  radius = 4,
  opacity = 1,
}) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number"
  ) {
    return null;
  }

  const pointColor =
    getConditionalColor({
      entry: payload,
      seriesKey: dataKey,
      settings,
      fallbackColor,
    });

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={pointColor}
      stroke={pointColor}
      strokeWidth={1}
      opacity={opacity}
    />
  );
}

function RadarChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
  visibleYKeys,
  onChartItemClick,
  selectedChartValues = [],
}) {
  const appearance =
    chartConfig.appearance || {};

  const yKeys =
    visibleYKeys ??
    (Array.isArray(chartConfig.y)
      ? chartConfig.y
      : chartConfig.y
        ? [chartConfig.y]
        : []);

  const total = yKeys.reduce(
    (grandTotal, key) =>
      grandTotal +
      getTotal(chartData, key),
    0,
  );

  const outerRadius = `${
    Math.max(
      20,
      Math.min(
        100,
        Number(
          appearance.outerRadius ?? 75,
        ),
      ),
    )
  }%`;

  const fillOpacity =
    Number(
      appearance.fillOpacity ?? 0.25,
    );

  const lineWidth =
    Number(
      appearance.lineWidth ?? 2,
    );

  const showPoints =
    appearance.showPoints ?? true;

  const showGrid =
    appearance.showGrid ?? true;

  const gridType =
    appearance.gridType ?? "polygon";

  const seriesOpacity =
    Number(
      appearance.opacity ?? 1,
    );

  const showAngleLabels =
    appearance.showAngleLabels ?? true;

  const showRadiusLabels =
    appearance.showRadiusLabels ?? true;

  const rawMinimum =
    typeof appearance.radiusMin === "number"
      ? appearance.radiusMin
      : 0;

  const rawMaximum =
    typeof appearance.radiusMax === "number"
      ? appearance.radiusMax
      : "auto";

  if (
    chartData.length === 0 ||
    yKeys.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select category and value fields to display the radar chart.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <RadarChart
          data={chartData}
          outerRadius={outerRadius}
          margin={{
            top: 30,
            right: 40,
            bottom: 30,
            left: 40,
          }}
          onClick={(event) => {
            const clickedItem =
              event?.activePayload?.[0]?.payload;

            if (clickedItem) {
              onChartItemClick?.(
                clickedItem,
              );
            }
          }}
        >
          {showGrid && (
            <PolarGrid
              gridType={gridType}
              strokeOpacity={
                appearance.gridOpacity ?? 0.4
              }
            />
          )}

          <PolarAngleAxis
            dataKey="x"
            tick={
              showAngleLabels
                ? {
                    fontSize:
                      appearance.angleLabelSize ??
                      11,
                  }
                : false
            }
            tickFormatter={(value) => {
              const text =
                String(value ?? "");

              const maxLength =
                appearance.maxLabelLength ??
                16;

              return text.length >
                maxLength
                ? `${text.slice(
                    0,
                    maxLength - 1,
                  )}…`
                : text;
            }}
          />

          <PolarRadiusAxis
            domain={[
              rawMinimum,
              rawMaximum,
            ]}
            tick={
              showRadiusLabels
                ? {
                    fontSize:
                      appearance.radiusLabelSize ??
                      10,
                  }
                : false
            }
            axisLine={
              appearance.showRadiusAxis ??
              true
            }
            tickFormatter={(value) =>
              formatValue(
                value,
                settings,
                total,
              )
            }
          />

          {settings.showLegend !== false &&
            yKeys.length > 1 && (
              <Legend />
            )}

          {settings.showTooltip !== false && (
            <Tooltip
              content={
                <CustomChartTooltip
                  settings={settings}
                  chartConfig={chartConfig}
                  total={total}
                />
              }
            />
          )}

          {yKeys.map(
            (key, index) => {
              const color =
                generatedColors[index] ||
                "#3b82f6";

              const hasSelection =
                selectedChartValues.length >
                0;

              return (
                <Radar
                  key={key}
                  dataKey={key}
                  name={key}
                  stroke={color}
                  fill={color}
                  strokeWidth={lineWidth}
                  fillOpacity={
                    hasSelection
                      ? fillOpacity * 0.45
                      : fillOpacity
                  }
                  opacity={seriesOpacity}
                  dot={
  showPoints
    ? (props) => {
        const row =
          props.payload;

        const isSelected =
          selectedChartValues.length ===
            0 ||
          selectedChartValues.some(
            (selectedValue) =>
              String(selectedValue) ===
              String(row?.x),
          );

        return (
          <ConditionalRadarDot
            {...props}
            dataKey={key}
            fallbackColor={color}
            settings={settings}
            radius={
              appearance.pointSize ??
              4
            }
            opacity={
              isSelected
                ? 1
                : 0.25
            }
          />
        );
      }
    : false
}
activeDot={
  showPoints
    ? (props) => (
        <ConditionalRadarDot
          {...props}
          dataKey={key}
          fallbackColor={color}
          settings={settings}
          radius={
            (appearance.pointSize ??
              4) + 2
          }
        />
      )
    : false
}
                  isAnimationActive={
                    appearance.animate !==
                    false
                  }
                />
              );
            },
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChartView;