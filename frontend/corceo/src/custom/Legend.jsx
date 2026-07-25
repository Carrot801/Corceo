import { useState, useMemo } from "react";

function Legend({
  chartData = [],
  rawData = [],
  generatedColors = [],
  settings = {},
  xField,
}) {
    const safeChartData = Array.isArray(chartData)
    ? chartData
    : [];

  const topXValues = new Set(
    safeChartData.map((item) => item.x).filter(Boolean)
  );
  const customLegendFields = settings.legendFields || [];

  const limitedRawData = rawData.filter((row) =>
    topXValues.has(row[xField])
  );
  console.log({
  xField,
  rawSample: rawData[0],
  limitedRawData,
  customLegendFields,
});

  const legendItems =
    customLegendFields.length > 0
      ? [
          ...new Set(
            limitedRawData.flatMap((row) =>
              customLegendFields.map((field) => row[field])
            )
          ),
        ].filter(Boolean)
      : chartData.map((item) => item.x).filter(Boolean);
  const sizeMap = {
    small: {
      dot: 10,
      text: "text-xs",
      gap: 6,
    },

    medium: {
      dot: 14,
      text: "text-sm",
      gap: 10,
    },

    large: {
      dot: 18,
      text: "text-base",
      gap: 14,
    },
  };

  const currentSize =
    sizeMap[settings.legendSize || "medium"];

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };

  const positionMap = {
    top: "order-first ",
    bottom: "order-last ",
    left: "mr-2",
    right: "ml-2",
  };

  const direction =
    settings.legendDirection === "column"
      ? "flex-col"
      : "flex-row flex-wrap";

  return (
    <div
      className={`
        flex
        ${direction}
        ${justifyMap[settings.legendAlign || "center"]}
        ${positionMap[settings.legendPosition || "bottom"]}
      `}
      style={{
        gap: `${settings.legendGap || currentSize.gap}px`,
      }}
    >

      {/* TITLE */}
      {settings.legendTitle && (
        <div className="w-full text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
          {settings.legendTitle}
        </div>
      )}

      {/* ITEMS */}
      {legendItems.map((field, index) => (
        <div
          key={index}
          className="flex items-center gap-2"
        >
          {/* COLOR */}
          <div
            className="rounded-sm shrink-0"
            style={{
              width: currentSize.dot,
              height: currentSize.dot,
              backgroundColor:
                generatedColors[index],
            }}
          />

          {/* LABEL */}
          <span
            className={`
              ${currentSize.text}
              text-slate-700
            `}
          >
            {field}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Legend;