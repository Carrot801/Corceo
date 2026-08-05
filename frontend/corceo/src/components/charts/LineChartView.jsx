import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Label,
} from "recharts";

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";

import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";

const SHAPES = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "star",
];



function ShapeIcon({
  shape,
  color,
}) {
  if (shape === "square") {
    return (
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        fill={color}
      />
    );
  }

  if (shape === "triangle") {
    return (
      <path
        d="M7 1 L13 13 L1 13 Z"
        fill={color}
      />
    );
  }

  if (shape === "diamond") {
    return (
      <path
        d="M7 1 L13 7 L7 13 L1 7 Z"
        fill={color}
      />
    );
  }

  if (shape === "star") {
    return (
      <path
        d="M7 1 L8.8 5 L13 5.2 L9.8 8 L10.8 12.5 L7 10 L3.2 12.5 L4.2 8 L1 5.2 L5.2 5 Z"
        fill={color}
      />
    );
  }

  return (
    <circle
      cx="7"
      cy="7"
      r="5"
      fill={color}
    />
  );
}

function CustomDot({
  cx,
  cy,
  stroke,
  color,
  shape,
  size = 4,
  opacity = 1,
}) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number"
  ) {
    return null;
  }

  const iconSize =
    Math.max(8, size * 3);

  const half =
    iconSize / 2;

  return (
    <svg
      x={cx - half}
      y={cy - half}
      width={iconSize}
      height={iconSize}
      viewBox="0 0 14 14"
      opacity={opacity}
      style={{
        overflow: "visible",
      }}
    >
      <ShapeIcon
        shape={shape}
        color={color || stroke}
      />
    </svg>
  );
}

function CustomLegend({
  yKeys,
  generatedColors,
}) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
      {yKeys.map(
        (key, index) => {
          const color =
            generatedColors[index] ||
            "#3b82f6";

          const shape =
            SHAPES[
              index %
                SHAPES.length
            ];

          return (
            <div
              key={key}
              className="flex items-center gap-1"
            >
              <svg
                width={14}
                height={14}
              >
                <ShapeIcon
                  shape={shape}
                  color={color}
                />
              </svg>

              <span>{key}</span>
            </div>
          );
        },
      )}
    </div>
  );
}

function LineChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
  visibleYKeys,
  onChartItemClick,
  selectedChartValues = [],
}) {
  const yKeys =
    visibleYKeys ??
    (
      Array.isArray(
        chartConfig.y,
      )
        ? chartConfig.y
        : chartConfig.y
          ? [chartConfig.y]
          : []
    );

  const appearance =
    chartConfig.appearance || {};

  const xAxisSettings =
    appearance.xAxis || {};

  const yAxisSettings =
    appearance.yAxis || {};

  const lineWidth =
    Number(
      appearance.lineWidth ??
        3,
    );

  const pointSize =
    Number(
      appearance.pointSize ??
        4,
    );

  const showPoints =
    appearance.showPoints ??
    true;

  const connectNulls =
    appearance.connectNulls ??
    false;

  const seriesOpacity =
    Number(
      appearance.opacity ?? 1,
    );

  const lineTypeMap = {
    smooth: "monotone",
    linear: "linear",
    step: "step",
  };

  const lineType =
    lineTypeMap[
      appearance.lineStyle ??
        "smooth"
    ] || "monotone";

  const total =
    chartData.reduce(
      (sum, row) =>
        sum +
        yKeys.reduce(
          (
            seriesTotal,
            key,
          ) =>
            seriesTotal +
            (
              Number(
                row[key],
              ) || 0
            ),
          0,
        ),
      0,
    );

  const getDynamicWidth = () => {
    if (
      settings.compactNumbers
    ) {
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

  const labelLayout =
    xAxisSettings.labelLayout ??
    "auto";

  const resolvedLabelLayout =
    labelLayout === "auto"
      ? chartData.length > 12
        ? "angled"
        : "horizontal"
      : labelLayout;

  const xAxisAngle =
    resolvedLabelLayout ===
    "angled"
      ? -35
      : resolvedLabelLayout ===
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
      : resolvedLabelLayout ===
          "vertical"
        ? 85
        : resolvedLabelLayout ===
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

  const calculatedYAxisWidth =
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
    showXGrid ||
    showYGrid;

  const rawYMin =
    typeof yAxisSettings.min ===
    "number"
      ? yAxisSettings.min
      : null;

  const rawYMax =
    typeof yAxisSettings.max ===
    "number"
      ? yAxisSettings.max
      : null;

  const hasValidRange =
    rawYMin === null ||
    rawYMax === null ||
    rawYMin < rawYMax;

  const yMin =
    hasValidRange &&
    rawYMin !== null
      ? rawYMin
      : yAxisSettings.includeZero !==
          false
        ? 0
        : "auto";

  const yMax =
    hasValidRange &&
    rawYMax !== null
      ? rawYMax
      : "auto";

  if (
    chartData.length === 0 ||
    yKeys.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select X and Y fields to display the line chart.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={chartData}
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
              horizontal={
                showYGrid
              }
              vertical={
                showXGrid
              }
              opacity={
                appearance.gridOpacity ??
                0.35
              }
            />
          )}

          {xAxisSettings.visible !==
            false && (
            <XAxis
              dataKey="x"
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
                const text =
                  String(
                    value ??
                    "",
                  );

                const maxLength =
                  xAxisSettings.maxLabelLength ??
                  18;

                return text.length >
                  maxLength
                  ? `${text.slice(
                      0,
                      maxLength -
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
              domain={[
                yMin,
                yMax,
              ]}
              allowDataOverflow={
                typeof yAxisSettings.min ===
                  "number" ||
                typeof yAxisSettings.max ===
                  "number"
              }
              width={
                calculatedYAxisWidth
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

          {settings.showLegend !==
            false && (
            <Legend
              content={() => (
                <CustomLegend
                  yKeys={
                    yKeys
                  }
                  generatedColors={
                    generatedColors
                  }
                />
              )}
            />
          )}

          {settings.showTooltip !==
            false && (
            <Tooltip
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

          {yKeys.map(
            (
              key,
              index,
            ) => {
              const color =
                generatedColors[
                  index
                ] ||
                "#3b82f6";

              const shape =
                SHAPES[
                  index %
                    SHAPES.length
                ];

              return (
                <Line
                  key={key}
                  type={
                    lineType
                  }
                  dataKey={key}
                  name={key}
                  stroke={color}
                  strokeWidth={
                    lineWidth
                  }
                  connectNulls={
                    connectNulls
                  }
                  opacity={
                    seriesOpacity
                  }
                  isAnimationActive={
                    appearance.animate !==
                    false
                  }
                  onClick={(
                    data,
                  ) => {
                    const clickedItem =
                      data?.payload ||
                      data?.activePayload?.[0]
                        ?.payload ||
                      data;

                    onChartItemClick?.(
                      clickedItem,
                    );
                  }}
                  className={
                    onChartItemClick
                      ? "cursor-pointer"
                      : ""
                  }
                  dot={
  showPoints
    ? (props) => {
        const row =
          props.payload;

        const isSelected =
          selectedChartValues.length ===
            0 ||
          selectedChartValues.some(
            (value) =>
              String(value) ===
              String(row?.x),
          );

        const pointColor =
          getConditionalColor({
            entry: row,
            seriesKey: key,
            settings,
            fallbackColor: color,
          });

        return (
          <CustomDot
            {...props}
            color={pointColor}
            shape={shape}
            size={pointSize}
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
                  activeDot={(props) => {
  const row =
    props.payload;

  const pointColor =
    getConditionalColor({
      entry: row,
      seriesKey: key,
      settings,
      fallbackColor: color,
    });

  return (
    <CustomDot
      {...props}
      color={pointColor}
      shape={shape}
      size={pointSize + 2}
    />
  );
}}
                />
              );
            },
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartView;