import { useMemo } from "react";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  Label,
  ReferenceLine,
} from "recharts";

import { formatValue } from "../../utils/formatters";

import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";


function WaterfallChartView({
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

  const yKey =
    getYKey(chartConfig);

  const total =
    getTotal(chartData, yKey);

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

  /*
   * Waterfall geometry.
   *
   * Color settings are intentionally excluded
   * from this memoized data. Changing a color
   * therefore does not rebuild cumulative values.
   */
  const waterfallData = useMemo(() => {
    if (!yKey) {
      return [];
    }

    let runningTotal = 0;

    const rows = chartData.map(
      (item, index) => {
        const value =
          Number(item[yKey]) || 0;

        const start =
          runningTotal;

        const end =
          start + value;

        runningTotal = end;

        return {
          ...item,

          x:
            item.x ??
            `Item ${index + 1}`,

          y: value,

          [yKey]:
            value,

          start,
          end,

          base:
            Math.min(
              start,
              end,
            ),

          change:
            Math.abs(value),

          originalValue:
            value,

          connectorValue:
            end,

          isTotal:
            false,

          sourceIndex:
            index,
        };
      },
    );

    if (
      appearance.showTotal !== false &&
      rows.length > 0
    ) {
      rows.push({
        x:
          appearance.totalLabel ??
          "Total",

        y:
          runningTotal,

        [yKey]:
          runningTotal,

        start:
          0,

        end:
          runningTotal,

        base:
          Math.min(
            0,
            runningTotal,
          ),

        change:
          Math.abs(
            runningTotal,
          ),

        originalValue:
          runningTotal,

        connectorValue:
          runningTotal,

        isTotal:
          true,

        sourceIndex:
          -1,
      });
    }

    return rows;
  }, [
    chartData,
    yKey,
    appearance.showTotal,
    appearance.totalLabel,
  ]);

  /*
   * Automatic Y-axis range.
   */
  const chartMinimum =
    waterfallData.length > 0
      ? Math.min(
          0,
          ...waterfallData.flatMap(
            (row) => [
              row.start,
              row.end,
            ],
          ),
        )
      : 0;

  const chartMaximum =
    waterfallData.length > 0
      ? Math.max(
          0,
          ...waterfallData.flatMap(
            (row) => [
              row.start,
              row.end,
            ],
          ),
        )
      : 0;

  /*
   * X-axis labels.
   */
  const labelLayout =
    xAxisSettings.labelLayout ??
    "auto";

  const resolvedLabelLayout =
    labelLayout === "auto"
      ? waterfallData.length > 12
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

  /*
   * Axis titles.
   */
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

  /*
   * Space reserved for X-axis labels and title.
   */
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

  /*
   * Space reserved for Y-axis labels and title.
   */
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

  /*
   * Grid.
   */
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

  /*
   * User-defined Y-axis range.
   */
  const customMinimum =
    typeof yAxisSettings.min ===
    "number"
      ? yAxisSettings.min
      : null;

  const customMaximum =
    typeof yAxisSettings.max ===
    "number"
      ? yAxisSettings.max
      : null;

  const validRange =
    customMinimum === null ||
    customMaximum === null ||
    customMinimum <
      customMaximum;

  const automaticMinimum =
    yAxisSettings.includeZero ===
    false
      ? chartMinimum
      : Math.min(
          chartMinimum,
          0,
        );

  const automaticMaximum =
    yAxisSettings.includeZero ===
    false
      ? chartMaximum
      : Math.max(
          chartMaximum,
          0,
        );

  const yMinimum =
    validRange &&
    customMinimum !== null
      ? customMinimum
      : automaticMinimum;

  const yMaximum =
    validRange &&
    customMaximum !== null
      ? customMaximum
      : automaticMaximum;

  /*
   * Bar appearance.
   */
  const barWidthPercent =
    Math.min(
      100,
      Math.max(
        5,
        Number(
          appearance.barWidthPercent ??
            70,
        ),
      ),
    );

  const categoryGap =
    (100 - barWidthPercent) /
    2;

  const barRadius =
    Number(
      appearance.barRadius ??
        6,
    );

  const barOpacity =
    Number(
      appearance.opacity ??
        1,
    );

  /*
   * Connector appearance.
   */
  const showConnectors =
    appearance.showConnectors ??
    true;

  const connectorColor =
    appearance.connectorColor ??
    "#94a3b8";

  const connectorWidth =
    Number(
      appearance.connectorWidth ??
        1,
    );

  const connectorDasharray =
    appearance.connectorStyle ===
    "dashed"
      ? "6 4"
      : appearance.connectorStyle ===
          "dotted"
        ? "2 4"
        : undefined;

  /*
   * Other appearance options.
   */
  const showZeroLine =
    appearance.showZeroLine ??
    true;

  const showHoverGuide =
    appearance.showHoverGuide ??
    true;

  /*
   * Keep Waterfall animation disabled.
   *
   * Native color pickers emit many updates while
   * dragging. Recharts can repeatedly restart its
   * stacked-bar animation and cause an update loop.
   */
  const waterfallAnimationEnabled =
    false;

  /*
   * Colors are calculated separately from
   * waterfallData.
   */
  const getEntryColor = (
    entry,
  ) => {
    if (entry.isTotal) {
      return (
        appearance.totalColor ??
        "#3b82f6"
      );
    }

    if (
      entry.originalValue < 0
    ) {
      return (
        appearance.decreaseColor ??
        "#ef4444"
      );
    }

    const colorCount =
      generatedColors.length;

    const paletteColor =
      colorCount > 0 &&
      entry.sourceIndex >= 0
        ? generatedColors[
            entry.sourceIndex %
              colorCount
          ]
        : null;

    return (
      appearance.increaseColor ??
      paletteColor ??
      "#22c55e"
    );
  };

  if (
    !yKey ||
    chartData.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select category and value fields to display the waterfall chart.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ComposedChart
          data={waterfallData}
          barGap={
            appearance.barGap ??
            4
          }
          barCategoryGap={`${categoryGap}%`}
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
                    value ?? "",
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
              domain={[
                yMinimum,
                yMaximum,
              ]}
              allowDataOverflow={
                customMinimum !==
                  null ||
                customMaximum !==
                  null
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

          {showZeroLine && (
            <ReferenceLine
              y={0}
              stroke={
                appearance.zeroLineColor ??
                "#64748b"
              }
              strokeWidth={
                appearance.zeroLineWidth ??
                1
              }
            />
          )}

          {settings.showTooltip !==
            false && (
            <Tooltip
              cursor={
                showHoverGuide
                  ? {
                      fill:
                        "rgba(148, 163, 184, 0.12)",
                    }
                  : false
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
                  payload.find(
                    (item) =>
                      item.dataKey ===
                      "change",
                  )?.payload ??
                  payload[0]?.payload;

                if (!row) {
                  return null;
                }

                const fields =
                  settings.tooltipFields ??
                  [];

                const showName =
                  fields.length === 0 ||
                  fields.includes(
                    "name",
                  ) ||
                  fields.includes(
                    chartConfig.x,
                  );

                const showValue =
                  fields.length === 0 ||
                  fields.includes(
                    "value",
                  ) ||
                  fields.includes(
                    yKey,
                  );

                return (
                  <div className="app-menu app-border min-w-44 rounded-lg border p-3 text-sm shadow-lg">
                    {showName && (
                      <p className="app-text font-bold">
                        {row.x}
                      </p>
                    )}

                    {showValue && (
                      <p className="app-text-secondary mt-1">
                        {row.isTotal
                          ? "Total"
                          : "Change"}
                        :{" "}
                        {formatValue(
                          row.originalValue,
                          settings,
                          total,
                        )}
                      </p>
                    )}

                    {fields.includes(
                      "percentage",
                    ) && (
                      <p className="app-text-secondary">
                        Percentage:{" "}
                        {getPercent(
                          row.originalValue,
                          total,
                        ).toFixed(1)}
                        %
                      </p>
                    )}

                    {!row.isTotal && (
                      <>
                        <p className="app-text-secondary">
                          Start:{" "}
                          {formatValue(
                            row.start,
                            settings,
                            total,
                          )}
                        </p>

                        <p className="app-text-secondary">
                          End:{" "}
                          {formatValue(
                            row.end,
                            settings,
                            total,
                          )}
                        </p>
                      </>
                    )}

                    {(
                      settings.tooltipExtraFields ||
                      []
                    ).map(
                      (field) => (
                        <p
                          key={
                            field
                          }
                          className="app-text-secondary"
                        >
                          {field}:{" "}
                          {String(
                            row[
                              field
                            ] ??
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

          <Bar
            dataKey="base"
            stackId="waterfall"
            fill="transparent"
            isAnimationActive={
              false
            }
          />

          <Bar
            dataKey="change"
            stackId="waterfall"
            opacity={
              barOpacity
            }
            isAnimationActive={
              waterfallAnimationEnabled
            }
            radius={[
              barRadius,
              barRadius,
              appearance.roundBottom
                ? barRadius
                : 0,
              appearance.roundBottom
                ? barRadius
                : 0,
            ]}
            onClick={(data) => {
              const clickedRow =
                data?.payload ??
                data
                  ?.activePayload?.[0]
                  ?.payload ??
                data;

              onChartItemClick?.(
                clickedRow,
              );
            }}
            className={
              onChartItemClick
                ? "cursor-pointer"
                : ""
            }
          >
            {waterfallData.map(
              (
                entry,
                index,
              ) => {
                const isSelected =
                  selectedChartValues.length ===
                    0 ||
                  selectedChartValues.some(
                    (
                      selectedValue,
                    ) =>
                      String(
                        selectedValue,
                      ) ===
                      String(
                        entry.x,
                      ),
                  );

                return (
                  <Cell
                    key={`waterfall-cell-${entry.x}-${index}`}
                    fill={getConditionalColor({
                      entry,
                      seriesKey: yKey,
                      settings,
                      fallbackColor: getEntryColor(entry),
                    })}
                    opacity={
                      isSelected
                        ? barOpacity
                        : 0.25
                    }
                  />
                );
              },
            )}
          </Bar>

          {showConnectors && (
            <Line
              type="stepAfter"
              dataKey="connectorValue"
              stroke={
                connectorColor
              }
              strokeWidth={
                connectorWidth
              }
              strokeDasharray={
                connectorDasharray
              }
              dot={false}
              activeDot={false}
              connectNulls
              legendType="none"
              isAnimationActive={
                false
              }
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WaterfallChartView;