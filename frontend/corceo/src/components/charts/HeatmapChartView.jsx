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
  LabelList,
} from "recharts";

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";
import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";

function HeatmapCellShape({
  cx,
  cy,
  size,
  fill,
  opacity,
  radius,
  showBorder,
  borderColor,
  borderWidth,
  value,
  showValue,
  valueColor,
  valueSize,
  onClick,
}) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number"
  ) {
    return null;
  }

  const sideLength = Math.max(
    10,
    Math.sqrt(Number(size) || 400),
  );

  return (
    <g
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <rect
        x={cx - sideLength / 2}
        y={cy - sideLength / 2}
        width={sideLength}
        height={sideLength}
        rx={radius}
        ry={radius}
        fill={fill}
        fillOpacity={opacity}
        stroke={
          showBorder
            ? borderColor
            : "none"
        }
        strokeWidth={
          showBorder
            ? borderWidth
            : 0
        }
      />

      {showValue && (
        <text
          x={cx}
          y={cy}
          fill={valueColor}
          fontSize={valueSize}
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="central"
          pointerEvents="none"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function interpolateColor(
  startColor,
  endColor,
  factor,
) {
  const normalizedFactor = Math.max(
    0,
    Math.min(1, factor),
  );

  const parseHex = (color) => {
    const hex = color.replace("#", "");

    return {
      red: Number.parseInt(
        hex.slice(0, 2),
        16,
      ),
      green: Number.parseInt(
        hex.slice(2, 4),
        16,
      ),
      blue: Number.parseInt(
        hex.slice(4, 6),
        16,
      ),
    };
  };

  const start = parseHex(startColor);
  const end = parseHex(endColor);

  const red = Math.round(
    start.red +
      (end.red - start.red) *
        normalizedFactor,
  );

  const green = Math.round(
    start.green +
      (end.green - start.green) *
        normalizedFactor,
  );

  const blue = Math.round(
    start.blue +
      (end.blue - start.blue) *
        normalizedFactor,
  );

  return `rgb(${red}, ${green}, ${blue})`;
}

function HeatmapChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
  onChartItemClick,
  selectedChartValues = [],
}) {
  const appearance =
    chartConfig.appearance || {};

  const yKey = Array.isArray(
    chartConfig?.y,
  )
    ? chartConfig.y[0]
    : chartConfig?.y || null;

  if (
    !yKey ||
    chartData.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select X and Y fields to display the heatmap.
      </div>
    );
  }

  const total = chartData.reduce(
    (sum, row) =>
      sum +
      (Number(row[yKey]) || 0),
    0,
  );

  const numericValues =
    chartData.map(
      (row) =>
        Number(row[yKey]) || 0,
    );

  const minimumValue = Math.min(
    ...numericValues,
    0,
  );

  const maximumValue = Math.max(
    ...numericValues,
    1,
  );

  const valueRange =
    maximumValue - minimumValue || 1;

  const colorScale =
    appearance.colorScale ??
    "sequential";

  const lowColor =
    appearance.lowColor ??
    generatedColors[0] ??
    "#dbeafe";

  const highColor =
    appearance.highColor ??
    generatedColors[
      generatedColors.length - 1
    ] ??
    "#1d4ed8";

  const negativeColor =
    appearance.negativeColor ??
    "#ef4444";

  const neutralColor =
    appearance.neutralColor ??
    "#f8fafc";

  const positiveColor =
    appearance.positiveColor ??
    "#22c55e";

  const getCellColor = (value) => {
    if (
      colorScale === "diverging"
    ) {
      if (value < 0) {
        const negativeFactor =
          minimumValue === 0
            ? 0
            : Math.abs(value) /
              Math.abs(minimumValue);

        return interpolateColor(
          neutralColor,
          negativeColor,
          negativeFactor,
        );
      }

      const positiveFactor =
        maximumValue === 0
          ? 0
          : value / maximumValue;

      return interpolateColor(
        neutralColor,
        positiveColor,
        positiveFactor,
      );
    }

    const factor =
      (value - minimumValue) /
      valueRange;

    return interpolateColor(
      lowColor,
      highColor,
      factor,
    );
  };

  const getPercentage = (value) =>
    total
      ? (Number(value) / total) * 100
      : 0;

  const cellSize =
    Number(
      appearance.cellSize ?? 32,
    );

  const cellGap =
    Number(
      appearance.cellGap ?? 3,
    );

  const cellRadius =
    Number(
      appearance.cellRadius ?? 3,
    );

  const cellOpacity =
    Number(
      appearance.opacity ?? 1,
    );

  const showCellBorders =
    appearance.showCellBorders ??
    true;

  const showValues =
    appearance.showValues ??
    true;

  const showGrid =
    appearance.showGrid ??
    settings.showGrid ??
    false;

  const data = chartData.map(
    (item, index) => {
      const value =
        Number(item[yKey]) || 0;

      return {
        ...item,

        xIndex:
          index + 1,

        xLabel:
          item.x,

        yIndex: 1,

        value,

        percentage:
          getPercentage(value),

        cellColor:
          item.color ||
          getCellColor(value),

        /*
         * ZAxis expects area, not width.
         */
        cellArea:
          Math.pow(
            Math.max(
              8,
              cellSize - cellGap,
            ),
            2,
          ),
      };
    },
  );

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ScatterChart
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 40,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={
                appearance.gridOpacity ??
                0.25
              }
              vertical
              horizontal={false}
            />
          )}

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
            interval={0}
            tickLine={false}
            axisLine={
              appearance.showXAxisLine ??
              false
            }
            tickMargin={8}
            tick={{
              fontSize:
                appearance.labelSize ??
                11,
            }}
            tickFormatter={(value) => {
              const item =
                data[value - 1];

              if (!item) {
                return "";
              }

              const text = String(
                item.xLabel ?? "",
              );

              const maximumLength =
                appearance.maxLabelLength ??
                15;

              return text.length >
                maximumLength
                ? `${text.slice(
                    0,
                    maximumLength - 1,
                  )}…`
                : text;
            }}
          />

          <YAxis
            type="number"
            dataKey="yIndex"
            hide
            domain={[0.5, 1.5]}
          />

          <ZAxis
            type="number"
            dataKey="cellArea"
            range={[
              Math.pow(
                Math.max(
                  8,
                  cellSize - cellGap,
                ),
                2,
              ),
              Math.pow(
                Math.max(
                  8,
                  cellSize - cellGap,
                ),
                2,
              ),
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
              content={({
                active,
                payload,
              }) => {
                if (
                  !active ||
                  !payload?.length
                ) {
                  return null;
                }

                const row =
                  payload[0].payload;

                return (
                  <div className="app-menu app-border min-w-44 rounded-lg border p-3 text-sm shadow-lg">
                    <p className="app-text font-bold">
                      {row.xLabel}
                    </p>

                    <p className="app-text-secondary mt-1">
                      {yKey}:{" "}
                      {formatValue(
                        row.value,
                        settings,
                        total,
                      )}
                    </p>

                    {settings.tooltipFields?.includes(
                      "percentage",
                    ) && (
                      <p className="app-text-secondary">
                        Percentage:{" "}
                        {row.percentage.toFixed(
                          1,
                        )}
                        %
                      </p>
                    )}

                    {(
                      settings.tooltipExtraFields ||
                      []
                    ).map(
                      (field) => (
                        <p
                          key={field}
                          className="app-text-secondary"
                        >
                          {field}:{" "}
                          {String(
                            row[field] ??
                              "—",
                          )}
                        </p>
                      ),
                    )}
                  </div>
                );
              }}
            />
          )}

          <Scatter
            data={data}
            isAnimationActive={
              appearance.animate !==
              false
            }
            shape={(props) => {
              const entry =
                props.payload;

              const isSelected =
                selectedChartValues.length ===
                  0 ||
                selectedChartValues.some(
                  (selectedValue) =>
                    String(
                      selectedValue,
                    ) ===
                    String(
                      entry.xLabel,
                    ),
                );

              return (
                <HeatmapCellShape
                  {...props}
                  fill={
                    entry.cellColor
                  }
                  opacity={
                    isSelected
                      ? cellOpacity
                      : 0.25
                  }
                  radius={
                    cellRadius
                  }
                  showBorder={
                    showCellBorders
                  }
                  borderColor={
                    appearance.cellBorderColor ??
                    "#ffffff"
                  }
                  borderWidth={
                    appearance.cellBorderWidth ??
                    1
                  }
                  value={
                    formatValue(
                      entry.value,
                      settings,
                      total,
                    )
                  }
                  showValue={
                    showValues
                  }
                  valueColor={
                    appearance.valueColor ??
                    "#0f172a"
                  }
                  valueSize={
                    appearance.valueSize ??
                    11
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
          />
        </ScatterChart>
      </ResponsiveContainer>

      {appearance.showColorLegend !==
        false && (
        <div className="app-text-muted mt-2 flex items-center justify-center gap-2 text-[10px]">
          <span>
            {formatValue(
              minimumValue,
              settings,
              total,
            )}
          </span>

          <div
            className="h-2 w-32 rounded-full"
            style={{
              background:
                colorScale ===
                "diverging"
                  ? `linear-gradient(to right, ${negativeColor}, ${neutralColor}, ${positiveColor})`
                  : `linear-gradient(to right, ${lowColor}, ${highColor})`,
            }}
          />

          <span>
            {formatValue(
              maximumValue,
              settings,
              total,
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export default HeatmapChartView;