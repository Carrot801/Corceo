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
  Label,
  Symbols,
} from "recharts";

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";
import { getTotal } from "../../utils/chartValueHelpers";
import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";
function CustomScatterPoint({
  cx,
  cy,
  fill,
  stroke,
  strokeWidth,
  size,
  shape,
  opacity,
  onClick,
}) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number"
  ) {
    return null;
  }

  return (
    <g
      onClick={onClick}
      style={{
        cursor: onClick
          ? "pointer"
          : "default",
      }}
    >
      <Symbols
        cx={cx}
        cy={cy}
        type={shape}
        size={size}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </g>
  );
}

function ScatterChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
  onChartItemClick,
  selectedChartValues = [],
}) {
  const appearance =
    chartConfig.appearance || {};

  const xAxisSettings =
    appearance.xAxis || {};

  const yAxisSettings =
    appearance.yAxis || {};

  const yKey = Array.isArray(
    chartConfig.y,
  )
    ? chartConfig.y[0]
    : chartConfig.y;

  const total = getTotal(
    chartData,
    yKey,
  );

  const getDynamicWidth = () => {
    if (settings.compactNumbers) {
      return 60;
    }

    if (
      settings.numberFormat ===
      "currency"
    ) {
      return 90;
    }

    return 80;
  };

  const data = chartData.map(
    (item, index) => ({
      ...item,

      xIndex: index + 1,

      xLabel:
        item.x ??
        `Item ${index + 1}`,

      y:
        Number(item[yKey]) || 0,

      color:
        item.color ||
        generatedColors[
          index %
            Math.max(
              generatedColors.length,
              1,
            )
        ] ||
        "#3b82f6",
    }),
  );

  const labelLayout =
    xAxisSettings.labelLayout ??
    "auto";

  const resolvedLayout =
    labelLayout === "auto"
      ? data.length > 12
        ? "angled"
        : "horizontal"
      : labelLayout;

  const xAxisAngle =
    resolvedLayout === "angled"
      ? -35
      : resolvedLayout ===
          "vertical"
        ? -90
        : 0;

  const showXAxisLabels =
    xAxisSettings.showLabels ??
    true;

  const showYAxisLabels =
    yAxisSettings.showLabels ??
    true;

  const showXAxisTitle =
    (
      xAxisSettings.showTitle ??
      true
    ) &&
    Boolean(
      xAxisSettings.title?.trim(),
    );

  const showYAxisTitle =
    (
      yAxisSettings.showTitle ??
      true
    ) &&
    Boolean(
      yAxisSettings.title?.trim(),
    );

  const xTitleSize =
    Number(
      xAxisSettings.titleSize ??
        12,
    );

  const yTitleSize =
    Number(
      yAxisSettings.titleSize ??
        12,
    );

  const xTitleDistance =
    Number(
      xAxisSettings.titleOffset ??
        10,
    );

  const yTitleDistance =
    Number(
      yAxisSettings.titleOffset ??
        10,
    );

  const xTickAreaHeight =
    !showXAxisLabels
      ? 5
      : resolvedLayout ===
          "vertical"
        ? 85
        : resolvedLayout ===
            "angled"
          ? 55
          : 28;

  const xTitleAreaHeight =
    showXAxisTitle
      ? xTitleSize +
        8 +
        xTitleDistance
      : 0;

  const xAxisHeight =
    xTickAreaHeight +
    xTitleAreaHeight;

  const yTickAreaWidth =
    showYAxisLabels
      ? getDynamicWidth()
      : 10;

  const yTitleAreaWidth =
    showYAxisTitle
      ? yTitleSize +
        8 +
        yTitleDistance
      : 0;

  const yAxisWidth =
    yAxisSettings.width ??
    (
      yTickAreaWidth +
      yTitleAreaWidth
    );

  const showXGrid =
    xAxisSettings.showGrid ??
    false;

  const showYGrid =
    yAxisSettings.showGrid ??
    settings.showGrid ??
    true;

  const showGrid =
    showXGrid || showYGrid;

  const rawYMinimum =
    typeof yAxisSettings.min ===
    "number"
      ? yAxisSettings.min
      : null;

  const rawYMaximum =
    typeof yAxisSettings.max ===
    "number"
      ? yAxisSettings.max
      : null;

  const validYRange =
    rawYMinimum === null ||
    rawYMaximum === null ||
    rawYMinimum <
      rawYMaximum;

  const yMinimum =
    validYRange &&
    rawYMinimum !== null
      ? rawYMinimum
      : yAxisSettings.includeZero !==
          false
        ? 0
        : "auto";

  const yMaximum =
    validYRange &&
    rawYMaximum !== null
      ? rawYMaximum
      : "auto";

  const pointSize =
    Math.max(
      2,
      Number(
        appearance.pointSize ?? 8,
      ),
    );

  /*
   * Recharts Symbols receives an area-like
   * value rather than a direct pixel radius.
   */
  const symbolSize =
    pointSize * pointSize * 4;

  const pointShapeMap = {
    circle: "circle",
    square: "square",
    diamond: "diamond",
    triangle: "triangle",
    star: "star",
    wye: "wye",
  };

  const pointShape =
    pointShapeMap[
      appearance.pointShape ??
        "circle"
    ] || "circle";

  const pointOpacity =
    Number(
      appearance.opacity ?? 0.8,
    );

  const showPointBorder =
    appearance.showPointBorder ??
    false;

  const pointBorderWidth =
    Number(
      appearance.pointBorderWidth ??
        1,
    );

  const pointBorderColor =
    appearance.pointBorderColor ??
    "#ffffff";

  const animate =
    appearance.animate ?? true;

  if (
    !yKey ||
    chartData.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select category and value fields to display the scatter chart.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ScatterChart
          margin={{
            top: 10,
            right: 10,
            left: 5,
            bottom: 5,
          }}
        >
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

          {xAxisSettings.visible !==
            false && (
            <XAxis
              type="number"
              dataKey="xIndex"
              domain={[
                0.5,
                data.length + 0.5,
              ]}
              ticks={data.map(
                (item) =>
                  item.xIndex,
              )}
              height={
                xAxisHeight
              }
              angle={
                xAxisAngle
              }
              interval={
                xAxisSettings.showEveryLabel
                  ? 0
                  : "preserveStartEnd"
              }
              minTickGap={
                xAxisSettings.minTickGap ??
                16
              }
              axisLine={
                xAxisSettings.showLine ??
                true
              }
              tickLine={
                xAxisSettings.showTicks ??
                false
              }
              tickMargin={
                xAxisSettings.tickMargin ??
                8
              }
              tick={
                showXAxisLabels
                  ? {
                      fontSize:
                        xAxisSettings.tickSize ??
                        11,

                      textAnchor:
                        xAxisAngle ===
                        0
                          ? "middle"
                          : "end",
                    }
                  : false
              }
              tickFormatter={(
                value,
              ) => {
                const item =
                  data.find(
                    (row) =>
                      row.xIndex ===
                      Number(value),
                  );

                if (!item) {
                  return "";
                }

                const text =
                  String(
                    item.xLabel ??
                      "",
                  );

                const maximumLength =
                  xAxisSettings.maxLabelLength ??
                  18;

                return text.length >
                  maximumLength
                  ? `${text.slice(
                      0,
                      maximumLength -
                        1,
                    )}…`
                  : text;
              }}
            >
              {showXAxisTitle && (
                <Label
                  value={
                    xAxisSettings.title
                  }
                  position="insideBottom"
                  offset={2}
                  style={{
                    fontSize:
                      xTitleSize,

                    fontWeight:
                      xAxisSettings.titleWeight ??
                      600,

                    textAnchor:
                      "middle",
                  }}
                />
              )}
            </XAxis>
          )}

          {yAxisSettings.visible !==
            false && (
            <YAxis
              type="number"
              dataKey="y"
              domain={[
                yMinimum,
                yMaximum,
              ]}
              allowDataOverflow={
                typeof yAxisSettings.min ===
                  "number" ||
                typeof yAxisSettings.max ===
                  "number"
              }
              width={
                yAxisWidth
              }
              axisLine={
                yAxisSettings.showLine ??
                false
              }
              tickLine={
                yAxisSettings.showTicks ??
                false
              }
              tickMargin={
                yAxisSettings.tickMargin ??
                8
              }
              tick={
                showYAxisLabels
                  ? {
                      fontSize:
                        yAxisSettings.tickSize ??
                        11,
                    }
                  : false
              }
              tickFormatter={(
                value,
              ) =>
                formatValue(
                  value,
                  settings,
                  total,
                )
              }
            >
              {showYAxisTitle && (
                <Label
                  value={
                    yAxisSettings.title
                  }
                  angle={-90}
                  position="insideLeft"
                  offset={4}
                  style={{
                    fontSize:
                      yTitleSize,

                    fontWeight:
                      yAxisSettings.titleWeight ??
                      600,

                    textAnchor:
                      "middle",
                  }}
                />
              )}
            </YAxis>
          )}

          <ZAxis
            type="number"
            range={[
              symbolSize,
              symbolSize,
            ]}
          />

          {settings.showTooltip !==
            false && (
            <Tooltip
              cursor={
                appearance.showHoverCursor ===
                false
                  ? false
                  : {
                      strokeDasharray:
                        "3 3",
                    }
              }
              content={
                <CustomChartTooltip
                  settings={
                    settings
                  }
                  chartConfig={
                    chartConfig
                  }
                  total={total}
                />
              }
            />
          )}

          <Scatter
            data={data}
            dataKey="y"
            isAnimationActive={
              animate
            }
            animationDuration={
              appearance.animationDuration ??
              500
            }
            shape={(props) => {
  const entry =
    props.payload;

  const isSelected =
    selectedChartValues.length ===
      0 ||
    selectedChartValues.some(
      (selectedValue) =>
        String(selectedValue) ===
        String(
          entry?.xLabel ??
            entry?.x,
        ),
    );

  const resolvedColor =
    getConditionalColor({
      entry,
      seriesKey: yKey,
      settings,
      fallbackColor:
        entry?.color ||
        props.fill ||
        "#3b82f6",
    });

  return (
    <CustomScatterPoint
      cx={props.cx}
      cy={props.cy}
      fill={resolvedColor}
      stroke={
        showPointBorder
          ? pointBorderColor
          : "none"
      }
      strokeWidth={
        showPointBorder
          ? pointBorderWidth
          : 0
      }
      size={symbolSize}
      shape={pointShape}
      opacity={
        isSelected
          ? pointOpacity
          : 0.25
      }
      onClick={
        onChartItemClick
          ? () =>
              onChartItemClick(
                entry,
              )
          : undefined
      }
    />
  );
}}
          >
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScatterChartView;