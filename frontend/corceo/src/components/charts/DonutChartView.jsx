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

function DonutChartView({
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

  /*
   * Sidebar values are percentages.
   *
   * Recharts accepts percentages such as:
   * "55%"
   * "80%"
   */
  const outerRadius = `${
    appearance.outerRadius ?? 80
  }%`;

  const innerRadius = `${
    appearance.innerRadius ?? 55
  }%`;

  const paddingAngle =
    Number(
      appearance.paddingAngle ?? 1,
    );

  const startAngle =
    Number(
      appearance.startAngle ?? 90,
    );

  /*
   * Recharts draws clockwise when
   * endAngle is lower than startAngle.
   */
  const endAngle =
    startAngle - 360;

  const chartOpacity =
    Number(
      appearance.opacity ?? 1,
    );

  const renderLabel = (props) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius:
        calculatedInnerRadius,
      outerRadius:
        calculatedOuterRadius,
      x,
      y,
      payload,
    } = props;

    const fontSize =
    Number(
      appearance.labelSize ??
        12,
    );

    let labelText = "";

    if (
      appearance.labelType === "name"
    ) {
      labelText =
        payload.x ?? "";
    } else if (
      appearance.labelType ===
      "percentage"
    ) {
      const percentage =
        getPercent(
          payload[yKey],
          total,
        );

      labelText =
        `${percentage.toFixed(
          settings.decimalPlaces ?? 0,
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
        calculatedInnerRadius +
        (
          calculatedOuterRadius -
          calculatedInnerRadius
        ) *
          0.5;

      const positionX =
        cx +
        radius *
          Math.cos(
            -midAngle * RADIAN,
          );

      const positionY =
        cy +
        radius *
          Math.sin(
            -midAngle * RADIAN,
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
        Select a value field to display the donut chart.
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
            right: 30,
            bottom: 20,
            left: 30,
          }}
        >
          <Pie
            data={chartData}
            dataKey={yKey}
            nameKey="x"
            innerRadius={
              innerRadius
            }
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
            opacity={
              chartOpacity
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
                    (selectedValue) =>
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
                    key={`donut-cell-${entry.x}-${index}`}
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

export default DonutChartView;