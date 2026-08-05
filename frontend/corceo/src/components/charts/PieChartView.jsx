import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import CustomChartTooltip from "../sidebar/CustomChartTooltip";
import { formatValue } from "../../utils/formatters";

import {
  getConditionalColor,
} from "../../utils/conditionalFormatting";


import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

function PieChartView({
  chartData = [],
  settings = {},
  generatedColors = [],
  chartConfig = {},
  onChartItemClick,
  selectedChartValues = [],
}) {
  const appearance =
    chartConfig.appearance || {};

  const yKey = getYKey(chartConfig);

  const total = getTotal(
    chartData,
    yKey,
  );

  const outerRadiusNumber =
    Math.max(
      20,
      Math.min(
        100,
        Number(
          appearance.outerRadius ??
            80,
        ),
      ),
    );

  const outerRadius =
    `${outerRadiusNumber}%`;

  const paddingAngle =
    Number(
      appearance.paddingAngle ??
        1,
    );

  const startAngle =
    Number(
      appearance.startAngle ??
        90,
    );

  const endAngle =
    startAngle - 360;

  const chartOpacity =
    Number(
      appearance.opacity ?? 1,
    );

  const selectedOffset =
    Number(
      appearance.selectedOffset ??
        0,
    );

  const renderLabel = (
    props,
  ) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius:
        calculatedOuterRadius,
      x,
      y,
      payload,
    } = props;

    const fontSize =
      Number(
        settings.labelSize ??
          12,
      );

    let labelText = "";

    if (
      settings.labelType ===
      "name"
    ) {
      labelText =
        payload.x ?? "";
    } else if (
      settings.labelType ===
      "percentage"
    ) {
      const percentage =
        getPercent(
          payload[yKey],
          total,
        );

      labelText =
        `${percentage.toFixed(
          settings.decimalPlaces ??
            0,
        )}%`;
    } else {
      labelText =
        formatValue(
          payload[yKey],
          settings,
          total,
        );
    }

    if (
      settings.labelPosition ===
      "inside"
    ) {
      const RADIAN =
        Math.PI / 180;

      const radius =
        innerRadius +
        (
          calculatedOuterRadius -
          innerRadius
        ) *
          0.58;

      const positionX =
        cx +
        radius *
          Math.cos(
            -midAngle *
              RADIAN,
          );

      const positionY =
        cy +
        radius *
          Math.sin(
            -midAngle *
              RADIAN,
          );

      return (
        <text
          x={positionX}
          y={positionY}
          fill={
            settings.labelColor ||
            "#ffffff"
          }
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight={
            settings.labelWeight ??
            600
          }
        >
          {labelText}
        </text>
      );
    }

    return (
      <text
        x={x}
        y={y}
        fill={
          settings.labelColor ||
          "currentColor"
        }
        textAnchor={
          x > cx
            ? "start"
            : "end"
        }
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={
          settings.labelWeight ??
          500
        }
      >
        {labelText}
      </text>
    );
  };

  if (
    !yKey ||
    chartData.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select a value field to display the pie chart.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart
          margin={{
            top: 20,
            right: 35,
            bottom: 20,
            left: 35,
          }}
        >
          <Pie
            data={chartData}
            dataKey={yKey}
            nameKey="x"
            innerRadius={0}
            outerRadius={
              outerRadius
            }
            paddingAngle={
              paddingAngle
            }
            startAngle={
              startAngle
            }
            endAngle={
              endAngle
            }
            minAngle={
              appearance.minSliceAngle ??
              0
            }
            cornerRadius={
              appearance.sliceRadius ??
              0
            }
            stroke={
              appearance.showSliceBorder ===
              false
                ? "none"
                : appearance.sliceBorderColor ||
                  "#ffffff"
            }
            strokeWidth={
              appearance.showSliceBorder ===
              false
                ? 0
                : appearance.sliceBorderWidth ??
                  1
            }
            label={
              settings.showLabels !==
              false
                ? renderLabel
                : false
            }
            labelLine={
              settings.showLabels !==
                false &&
              settings.labelPosition ===
                "outside"
            }
            onClick={(data) => {
              const clickedItem =
                data?.payload ||
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
          >
            {chartData.map(
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

                const fallbackColor =
                  generatedColors[
                    index %
                      Math.max(
                        generatedColors.length,
                        1,
                      )
                  ] ||
                  "#3b82f6";

                return (
                  <Cell
                    key={`pie-cell-${entry.x}-${index}`}
                    fill={getConditionalColor({
                      entry,
                      seriesKey: yKey,
                      settings,
                      fallbackColor:
                        entry.color ||
                        fallbackColor,
                    })}
                    opacity={
                      isSelected
                        ? chartOpacity
                        : 0.25
                    }
                    style={{
                      outline:
                        "none",
                      transform:
                        isSelected &&
                        selectedChartValues.length >
                          0 &&
                        selectedOffset >
                          0
                          ? `scale(${
                              1 +
                              selectedOffset /
                                100
                            })`
                          : "scale(1)",
                      transformOrigin:
                        "center",
                      transition:
                        "opacity 150ms ease, transform 150ms ease",
                    }}
                  />
                );
              },
            )}
          </Pie>

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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartView;