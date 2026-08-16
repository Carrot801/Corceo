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

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";
import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";


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

  const appearance =
    chartConfig.appearance || {};

  const xAxisSettings =
    appearance.xAxis || {};

  const yAxisSettings =
    appearance.yAxis || {};

  const getDynamicWidth = () => {
    if (settings.compactNumbers) {
      return 60;
    }

    if (settings.numberFormat === "currency") {
      return 90;
    }

    return 80;
  };


  
  const total = chartData.reduce(
    (sum, row) =>
      sum +
      yKeys.reduce(
        (seriesSum, key) =>
          seriesSum +
          (Number(row[key]) || 0),
        0
      ),
    0
  ); 
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
    Boolean(
      xAxisSettings.title?.trim()
    );

  const showYAxisTitle =
    (yAxisSettings.showTitle ?? true) &&
    Boolean(
      yAxisSettings.title?.trim()
    );

  const xTitleDistance =
  Number(xAxisSettings.titleOffset ?? 10);

const yTitleSize =
  Number(yAxisSettings.titleSize ?? 12);

const yTitleDistance =
  Number(yAxisSettings.titleOffset ?? 10);

const yTickAreaWidth =
  showYAxisLabels
    ? getDynamicWidth()
    : 10;

const yTitleAreaWidth =
  showYAxisTitle
    ? yTitleSize + 8 + yTitleDistance
    : 0;

const calculatedYAxisWidth =
  yAxisSettings.width ??
  (yTickAreaWidth + yTitleAreaWidth);


const xTitleSize =
  Number(xAxisSettings.titleSize ?? 12);

/*
 * Space needed by the category labels.
 */
const xTickAreaHeight = !showXAxisLabels
  ? 5
  : resolvedLabelLayout === "vertical"
    ? 85
    : resolvedLabelLayout === "angled"
      ? 55
      : 28;

/*
 * Space needed for the title itself.
 *
 * titleDistance adds space BETWEEN
 * the ticks/axis and the title.
 */
const xTitleAreaHeight = showXAxisTitle
  ? xTitleSize + 8 + xTitleDistance
  : 0;

const xAxisHeight =
  xTickAreaHeight + xTitleAreaHeight;

  /*
   * GRID
   */

  const showXGrid =
    xAxisSettings.showGrid ?? false;

  const showYGrid =
    yAxisSettings.showGrid ??
    settings.showGrid ??
    true;

  const showGrid =
    showXGrid || showYGrid;


const barWidthPercent = Math.min(
  100,
  Math.max(
    5,
    Number(appearance.barWidthPercent ?? 70)
  )
);

const barCategoryGapPercent =
  (100 - barWidthPercent) / 2;


const rawYMin =
  typeof yAxisSettings.min === "number"
    ? yAxisSettings.min
    : null;

const rawYMax =
  typeof yAxisSettings.max === "number"
    ? yAxisSettings.max
    : null;

const hasValidRange =
  rawYMin === null ||
  rawYMax === null ||
  rawYMin < rawYMax;

const yMin =
  hasValidRange && rawYMin !== null
    ? rawYMin
    : 0;

const yMax =
  hasValidRange && rawYMax !== null
    ? rawYMax
    : "auto";

  const barRadius =
    appearance.barRadius ?? 6;
    const yDomainMin =
  typeof yAxisSettings.min === "number"
    ? yAxisSettings.min
    : "auto";

const yDomainMax =
  typeof yAxisSettings.max === "number"
    ? yAxisSettings.max
    : "auto";

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
<BarChart
  data={chartData}
  barGap={appearance.barGap ?? 4}
  barCategoryGap={`${barCategoryGapPercent}%`}
  margin={{
    top: 10,
    right: 10,
    left: 5,
    bottom: 5,
  }}
>
          {/* GRID */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={showYGrid}
              vertical={showXGrid}
              opacity={
                appearance.gridOpacity ??
                0.35
              }
            />
          )}

          {/* X AXIS */}
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

    minTickGap={
      xAxisSettings.minTickGap ?? 16
    }

    axisLine={
      xAxisSettings.showLine ?? true
    }

    tickLine={
      xAxisSettings.showTicks ?? false
    }

    tickMargin={
      xAxisSettings.tickMargin ?? 8
    }

    tick={
      showXAxisLabels
        ? {
            fontSize:
              xAxisSettings.tickSize ?? 11,

            textAnchor:
              xAxisAngle === 0
                ? "middle"
                : "end",
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
        offset={2}
        style={{
          fontSize: xTitleSize,
          fontWeight:
            xAxisSettings.titleWeight ?? 600,
          textAnchor: "middle",
        }}
      />
    )}
  </XAxis>
)}

          {/* Y AXIS */}
          {yAxisSettings.visible !== false && (
  <YAxis
    domain={[yMin, yMax]}
     allowDataOverflow={
    typeof yAxisSettings.min === "number" ||
    typeof yAxisSettings.max === "number"
  }
    width={calculatedYAxisWidth}
    axisLine={
      yAxisSettings.showLine ?? false
    }
    tickLine={
      yAxisSettings.showTicks ?? false
    }
    tickMargin={
      yAxisSettings.tickMargin ?? 8
    }
    tick={
      showYAxisLabels
        ? {
            fontSize:
              yAxisSettings.tickSize ?? 11,
          }
        : false
    }
    tickFormatter={(value) =>
      formatValue(
        value,
        settings,
        total
      )
    }
  >
    {showYAxisTitle && (
      <Label
        value={yAxisSettings.title}
        angle={-90}
        position="insideLeft"
        offset={4}
        style={{
          fontSize: yTitleSize,
          fontWeight:
            yAxisSettings.titleWeight ?? 600,
          textAnchor: "middle",
        }}
      />
    )}
  </YAxis>
)}

          {/* TOOLTIP */}
          {settings.showTooltip !==
            false && (
            <Tooltip
  allowEscapeViewBox={{
    x: true,
    y: true,
  }}

  wrapperStyle={{
    zIndex: 999999,
    pointerEvents: "none",
  }}

  formatter={(value, name) => [
    formatValue(
      value,
      settings,
      total
    ),
    name,
  ]}

  content={
    <CustomChartTooltip
      settings={settings}
      total={total}
    />
  }
/>
          )}

          {/* BARS */}
          {yKeys.map(
            (
              key,
              seriesIndex
            ) => (
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
  opacity={appearance.opacity ?? 1}
  radius={[
    barRadius,
    barRadius,
    appearance.roundBottom ? barRadius : 0,
    appearance.roundBottom ? barRadius : 0,
  ]}
  fill={generatedColors[seriesIndex] || "#3b82f6"}
>
                {chartData.map(
                  (
                    entry,
                    rowIndex
                  ) => (
                    <Cell
                      key={`${key}-bar-cell-${rowIndex}`}
                      fill={getConditionalColor({
                        entry,
                        seriesKey: key,
                        settings,

                        fallbackColor:
                          entry.color ||
                          generatedColors[
                            seriesIndex %
                              Math.max(
                                generatedColors.length,
                                1
                              )
                          ] ||
                          "#3b82f6",
                      })}
                      opacity={
                        selectedChartValues.length ===
                          0 ||
                        selectedChartValues.some(
                          (
                            value
                          ) =>
                            String(
                              value
                            ) ===
                            String(
                              entry.x
                            )
                        )
                          ? 1
                          : 0.25
                      }
                    />
                  )
                )}
              </Bar>
            )
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartView;