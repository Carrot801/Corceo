import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
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

function TreemapContent({
  x,
  y,
  width,
  height,
  name,
  color,
  depth,
  size,
  percentage,

  cellGap,
  cellRadius,
  cellOpacity,

  showLabels,
  showValues,
  showBorders,

  borderColor,
  borderWidth,

  appearance,
  settings,
  total,

  selectedChartValues,
  onChartItemClick,
}) {
  if (depth === 0) {
    return null;
  }

  const isSelected =
    selectedChartValues.length === 0 ||
    selectedChartValues.some(
      (selectedValue) =>
        String(selectedValue) ===
        String(name),
    );

  const visibleOpacity =
    isSelected
      ? cellOpacity
      : 0.25;

  const horizontalInset =
    Math.max(0, cellGap / 2);

  const verticalInset =
    Math.max(0, cellGap / 2);

  const renderedWidth =
    Math.max(
      0,
      width - cellGap,
    );

  const renderedHeight =
    Math.max(
      0,
      height - cellGap,
    );

  const canShowName =
    showLabels &&
    renderedWidth > 55 &&
    renderedHeight > 28;

  const canShowValue =
    showValues &&
    renderedWidth > 70 &&
    renderedHeight > 48;

  return (
    <g
      onClick={() =>
        onChartItemClick?.({
          x: name,
          name,
          size,
          value: size,
          percentage,
        })
      }
      style={{
        cursor:
          onChartItemClick
            ? "pointer"
            : "default",
      }}
    >
      <rect
        x={x + horizontalInset}
        y={y + verticalInset}
        width={renderedWidth}
        height={renderedHeight}
        rx={cellRadius}
        ry={cellRadius}
        fill={color || "#3b82f6"}
        fillOpacity={visibleOpacity}
        stroke={
          showBorders
            ? borderColor
            : "none"
        }
        strokeWidth={
          showBorders
            ? borderWidth
            : 0
        }
        style={{
          transition:
            "fill-opacity 150ms ease",
        }}
      />

      {canShowName && (
        <text
          x={
            x +
            horizontalInset +
            8
          }
          y={
            y +
            verticalInset +
            19
          }
          fill={
            appearance.labelColor ??
            "#ffffff"
          }
          fontSize={
            appearance.labelSize ??
            settings.labelSize ??
            12
          }
          fontWeight={
            appearance.labelWeight ??
            600
          }
          pointerEvents="none"
        >
          {String(name)}
        </text>
      )}

      {canShowValue && (
        <text
          x={
            x +
            horizontalInset +
            8
          }
          y={
            y +
            verticalInset +
            37
          }
          fill={
            appearance.valueColor ??
            "#ffffff"
          }
          fillOpacity={0.9}
          fontSize={
            appearance.valueSize ??
            Math.max(
              9,
              Number(
                settings.labelSize ??
                  12,
              ) - 2,
            )
          }
          pointerEvents="none"
        >
          {formatValue(
            size,
            settings,
            total,
          )}
        </text>
      )}
    </g>
  );
}

function TreemapChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
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

  
  const aspectRatioMap = {
    golden: 1.618,
    square: 1,
    wide: 2,
  };

  const aspectRatio =
    typeof appearance.aspectRatio ===
    "number"
      ? appearance.aspectRatio
      : aspectRatioMap[
          appearance.aspectRatio ??
            "golden"
        ] ?? 1.618;

  const cellGap =
    Number(
      appearance.cellGap ?? 2,
    );

  const cellRadius =
    Number(
      appearance.cellRadius ?? 4,
    );

  const cellOpacity =
    Number(
      appearance.opacity ?? 1,
    );

  const showLabels =
    appearance.showParentLabels !==
      false &&
    settings.showLabels !== false;

  const showValues =
    appearance.showValues ??
    false;

  const showBorders =
    appearance.showCellBorders ??
    true;

  const borderColor =
    appearance.cellBorderColor ??
    "#ffffff";

  const borderWidth =
    Number(
      appearance.cellBorderWidth ??
        cellGap,
    );

const data = [
  {
    name: "root",

    children: chartData.map(
      (item, index) => {
        const value =
          Number(item[yKey]) || 0;

        const fallbackColor =
          item.color ||
          generatedColors[
            index %
              Math.max(
                generatedColors.length,
                1,
              )
          ] ||
          "#3b82f6";

        return {
          ...item,

          name:
            item.x ??
            `Item ${index + 1}`,

          x:
            item.x ??
            `Item ${index + 1}`,

          size: value,

          value,

          percentage:
            getPercent(
              value,
              total,
            ),

          color:
            getConditionalColor({
              entry: item,
              seriesKey: yKey,
              settings,
              fallbackColor,
            }),
        };
      },
    ),
  },
];

  if (
    !yKey ||
    chartData.length === 0
  ) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Select category and value fields to display the treemap.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          content={
  <TreemapContent
    cellGap={cellGap}
    cellRadius={cellRadius}
    cellOpacity={cellOpacity}

    showLabels={showLabels}
    showValues={showValues}
    showBorders={showBorders}

    borderColor={borderColor}
    borderWidth={borderWidth}

    appearance={appearance}
    settings={settings}
    total={total}

    selectedChartValues={
      selectedChartValues
    }
    onChartItemClick={
      onChartItemClick
    }
  />
}
          aspectRatio={
            aspectRatio
          }
          isAnimationActive={
            appearance.animate ??
            true
          }
          animationDuration={
            appearance.animationDuration ??
            500
          }
        >
          {settings.showTooltip !==
            false && (
            <Tooltip
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
                  payload[0]?.payload;

                if (
                  !row ||
                  row.name === "root"
                ) {
                  return null;
                }

                return (
                  <div className="app-menu app-border min-w-44 rounded-lg border p-3 text-sm shadow-lg">
                    <p className="app-text font-bold">
                      {row.name}
                    </p>

                    <p className="app-text-secondary mt-1">
                      {yKey}:{" "}
                      {formatValue(
                        row.size,
                        settings,
                        total,
                      )}
                    </p>

                    {settings.tooltipFields?.includes(
                      "percentage",
                    ) && (
                      <p className="app-text-secondary">
                        Percentage:{" "}
                        {getPercent(
                          row.size,
                          total,
                        ).toFixed(1)}
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
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

export default TreemapChartView;