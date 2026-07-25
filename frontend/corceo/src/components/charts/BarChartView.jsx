import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";

import { formatValue } from "../../utils/formatters";

function BarChartView({
  chartData,
  settings,
  generatedColors,
  chartConfig,
  visibleYKeys,
  onChartItemClick,
  selectedChartValues = [],
}) {
  const yKeys =
    visibleYKeys ??
    (Array.isArray(chartConfig.y)
      ? chartConfig.y
      : chartConfig.y
        ? [chartConfig.y]
        : []);
  const appearance = chartConfig.appearance || {};
  const xAxisSettings = appearance.xAxis || {};
  const yAxisSettings = appearance.yAxis || {};

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
        0,
      )
    );
  }, 0);

  const showXGrid = xAxisSettings.showGrid ?? false;

  /*
   * Preserve your old global grid setting as the default for Y grid.
   * Once the user changes the axis setting, that value takes priority.
   */
  const showYGrid =
    yAxisSettings.showGrid ?? settings.showGrid ?? true;

  const showGrid = showXGrid || showYGrid;

const labelLayout =
  xAxisSettings.labelLayout ?? "auto";

const resolvedLabelLayout =
  labelLayout === "auto"
    ? chartData.length > 12
      ? "angled"
      : "horizontal"
    : labelLayout;

const xAxisAngle =
  resolvedLabelLayout === "angled"
    ? -35
    : resolvedLabelLayout === "vertical"
      ? -90
      : 0;
      
  const showXAxisLabels =
    xAxisSettings.showLabels ?? true;

  const showYAxisLabels =
    yAxisSettings.showLabels ?? true;

  const showXAxisTitle =
    (xAxisSettings.showTitle ?? true) &&
    Boolean(xAxisSettings.title?.trim());

  const showYAxisTitle =
    (yAxisSettings.showTitle ?? true) &&
    Boolean(yAxisSettings.title?.trim());

  const xTitleOffset =
    xAxisSettings.titleOffset ?? 16;

  const yTitleOffset =
    yAxisSettings.titleOffset ?? 16;


  const xAxisTickSize = xAxisSettings.tickSize ?? 12;
  const yAxisAngle = yAxisSettings.angle ?? 0;
  const yAxisTickSize = yAxisSettings.tickSize ?? 12;

  const yMin =
    typeof yAxisSettings.min === "number"
      ? yAxisSettings.min
      : "auto";

  const yMax =
    typeof yAxisSettings.max === "number"
      ? yAxisSettings.max
      : "auto";

  const xTickAreaHeight = !showXAxisLabels
    ? 10
    : resolvedLabelLayout === "vertical"
      ? 110
      : resolvedLabelLayout === "angled"
        ? 80
        : 40;

  const xTitleAreaHeight = showXAxisTitle
    ? 36 + Math.max(0, xTitleOffset)
    : 0;

  const xAxisHeight =
    xTickAreaHeight + xTitleAreaHeight;
      
  const bottomMargin =
    Math.abs(xAxisAngle) > 60
      ? 90
      : Math.abs(xAxisAngle) > 30
        ? 65
        : Math.abs(xAxisAngle) > 0
          ? 45
          : 25;

  const barRadius = appearance.barRadius ?? 6;

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          barGap={appearance.barGap ?? 8}
          barCategoryGap={`${appearance.barCategoryGap ?? 10}%`}
          margin={{
            left: yAxisSettings.title ? 65 : 40,
            bottom: xAxisSettings.title
              ? bottomMargin + 25
              : bottomMargin,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={showYGrid}
              vertical={showXGrid}
              opacity={appearance.gridOpacity ?? 0.35}
            />
          )}

          {xAxisSettings.visible !== false && (
            <XAxis
              dataKey="x"
              height={xAxisHeight}
              angle={xAxisAngle}
              interval={
                xAxisSettings.showEveryLabel
                  ? 0
                  : "preserveStartEnd"
              }
              minTickGap={xAxisSettings.minTickGap ?? 16}
              axisLine={xAxisSettings.showLine ?? true}
              tickLine={xAxisSettings.showTicks ?? false}
              tickMargin={xAxisSettings.tickMargin ?? 8}
              tick={
                showXAxisLabels
                  ? {
                      fontSize: xAxisSettings.tickSize ?? 11,
                      textAnchor:
                        xAxisAngle === 0 ? "middle" : "end",
                    }
                  : false
              }
              tickFormatter={(value) => {
                const text = String(value ?? "");
                const maxLength =
                  xAxisSettings.maxLabelLength ?? 18;

                return text.length > maxLength
                  ? `${text.slice(0, maxLength - 1)}…`
                  : text;
              }}
            >
              {showXAxisTitle && (
                <Label
                  value={xAxisSettings.title}
                  position="insideBottom"
                  offset={-xTitleOffset}
                  style={{
                    fontSize: xAxisSettings.titleSize ?? 12,
                    fontWeight:
                      xAxisSettings.titleWeight ?? 600,
                    textAnchor: "middle",
                  }}
                />
              )}
            </XAxis>
          )}

          {yAxisSettings.visible !== false && (
            <YAxis
              domain={[yMin, yMax]}
              width={
                yAxisSettings.width ??
                (showYAxisTitle
                  ? getDynamicWidth() + Math.min(yTitleOffset, 24)
                  : getDynamicWidth())
              }
              axisLine={yAxisSettings.showLine ?? false}
              tickLine={yAxisSettings.showTicks ?? false}
              tickMargin={yAxisSettings.tickMargin ?? 8}
              tick={
                showYAxisLabels
                  ? {
                      fontSize: yAxisSettings.tickSize ?? 11,
                    }
                  : false
              }
              tickFormatter={(value) =>
                formatValue(value, settings, total)
              }
            >
              {showYAxisTitle && (
                <Label
                  value={yAxisSettings.title}
                  angle={-90}
                  position="insideLeft"
                  offset={-yTitleOffset}
                  style={{
                    fontSize: yAxisSettings.titleSize ?? 12,
                    fontWeight:
                      yAxisSettings.titleWeight ?? 600,
                    textAnchor: "middle",
                  }}
                />
              )}
            </YAxis>
          )}

          <Tooltip
            formatter={(value, name) => [
              formatValue(value, settings, total),
              name,
            ]}
          />

          {yKeys.map((key, seriesIndex) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              onClick={(data) => {
                const clickedItem =
                  data?.payload ||
                  data?.activePayload?.[0]?.payload ||
                  data;

                onChartItemClick?.(clickedItem);
              }}
              className="cursor-pointer"
              barSize={appearance.barSize ?? undefined}
              maxBarSize={appearance.maxBarSize ?? 100}
              opacity={appearance.opacity ?? 1}
              radius={[
                barRadius,
                barRadius,
                appearance.roundBottom ? barRadius : 0,
                appearance.roundBottom ? barRadius : 0,
              ]}
              fill={generatedColors[seriesIndex] || "#3b82f6"}
            >
              {chartData.map((entry, rowIndex) => (
                <Cell
                  key={`${key}-bar-cell-${rowIndex}`}
                  fill={
                    entry.color ||
                    generatedColors[
                      seriesIndex % generatedColors.length
                    ] ||
                    "#3b82f6"
                  }
                  opacity={
                    selectedChartValues.length === 0 ||
                    selectedChartValues.some(
                      (value) => String(value) === String(entry.x)
                    )
                      ? 1
                      : 0.25
                  }
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartView;
