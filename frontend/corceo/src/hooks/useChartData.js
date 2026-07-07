import { useMemo } from "react";
import { generatePalette } from "../custom/colorPallets";

function normalizeDateValue(value) {
  if (!value) return "";

  const str = String(value);

  // 2024
  if (/^\d{4}$/.test(str)) return str;

  // 2024 Q1
  if (/^\d{4}\sQ[1-4]$/.test(str)) return str;

  // 2024-01
  if (/^\d{4}-\d{2}$/.test(str)) return str;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return str;

  return date.toISOString().slice(0, 10);
}

function getSortValue(row, sortBy) {
  if (!sortBy) return row.x;
  return row[sortBy] ?? row.x;
}

function aggregateData(rawData, x, yFields, mode) {
  const yKeys = Array.isArray(yFields) ? yFields : yFields ? [yFields] : [];

  if (mode === "none") {
    return rawData.map((row) => {
      const result = { x: row[x] };

      yKeys.forEach((key) => {
        result[key] = Number(row[key]) || 0;
      });

      return result;
    });
  }

  const map = new Map();

  rawData.forEach((row) => {
    const xValue = row[x];

    if (!map.has(xValue)) map.set(xValue, {});

    yKeys.forEach((key) => {
      const value = Number(row[key]) || 0;

      if (!map.get(xValue)[key]) map.get(xValue)[key] = [];

      map.get(xValue)[key].push(value);
    });
  });

  return Array.from(map.entries()).map(([xValue, valuesByKey]) => {
    const result = { x: xValue };

    yKeys.forEach((key) => {
      const values = valuesByKey[key] || [];

      switch (mode) {
        case "avg":
          result[key] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case "min":
          result[key] = Math.min(...values);
          break;
        case "max":
          result[key] = Math.max(...values);
          break;
        case "count":
          result[key] = values.length;
          break;
        case "sum":
        default:
          result[key] = values.reduce((a, b) => a + b, 0);
      }
    });

    return result;
  });
}
function sortData(chartRows, chartConfig, yFields) {
  const yKeys = Array.isArray(yFields) ? yFields : yFields ? [yFields] : [];
  const firstKey = yKeys[0];

  if (chartConfig.sort === "none") return chartRows;

  const sortKey = chartConfig.sortBy || firstKey;
  if (!sortKey) return chartRows;

  return [...chartRows].sort((a, b) => {
    const av = Number(a[sortKey]) || 0;
    const bv = Number(b[sortKey]) || 0;

    return chartConfig.sort === "desc" ? bv - av : av - bv;
  });
}

function useChartData({ data, chartConfig, settings }) {
  const processedData = useMemo(() => {
    const yKeys = Array.isArray(chartConfig.y)
      ? chartConfig.y
      : chartConfig.y
        ? [chartConfig.y]
        : [];

    if (!data || !chartConfig.x || yKeys.length === 0) return [];

    let result = aggregateData(
      data,
      chartConfig.x,
      yKeys,
      chartConfig.aggregation
    );

    result = sortData(result, chartConfig, yKeys);

    if (chartConfig.limit) {
      result = result.slice(0, Number(chartConfig.limit));
    }

    return result;
  }, [
    data,
    chartConfig.x,
    chartConfig.y,
    chartConfig.aggregation,
    chartConfig.sort,
    chartConfig.sortBy,
    chartConfig.limit,
  ]);

  const generatedColors = useMemo(() => {
    const yCount = Array.isArray(chartConfig.y)
      ? chartConfig.y.length
      : chartConfig.y
        ? 1
        : processedData.length;

    return generatePalette(
      settings.palette,
      settings.paletteMode,
      Math.max(yCount, processedData.length)
    );
  }, [
    settings.palette,
    settings.paletteMode,
    processedData.length,
    chartConfig.y,
  ]);

  return {
    chartData: processedData,
    generatedColors,
  };
}

export default useChartData;