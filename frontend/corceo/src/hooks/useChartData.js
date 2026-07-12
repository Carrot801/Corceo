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
function sortData(chartRows, sorting, yFields) {
  if (!sorting || sorting.direction === "none") {
    return chartRows;
  }

  const yKeys = Array.isArray(yFields)
    ? yFields
    : yFields
      ? [yFields]
      : [];

  const field = sorting.field || yKeys[0];

  if (!field) return chartRows;

  return [...chartRows].sort((a, b) => {
    const aValue = field === "x" ? a.x : a[field];
    const bValue = field === "x" ? b.x : b[field];

    const aNumber = Number(aValue);
    const bNumber = Number(bValue);

    let comparison;

    if (
      !Number.isNaN(aNumber) &&
      !Number.isNaN(bNumber)
    ) {
      comparison = aNumber - bNumber;
    } else {
      comparison = String(aValue ?? "").localeCompare(
        String(bValue ?? ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    }

    return sorting.direction === "desc"
      ? -comparison
      : comparison;
  });
}
function applyRanking(chartRows, ranking, yFields) {
  if (!ranking?.enabled) {
    return chartRows;
  }

  const yKeys = Array.isArray(yFields)
    ? yFields
    : yFields
      ? [yFields]
      : [];

  const field = ranking.field || yKeys[0];
  const count = Math.max(1, Number(ranking.count) || 10);

  if (!field) {
    return chartRows.slice(0, count);
  }

  const sorted = [...chartRows].sort((a, b) => {
    const aValue = Number(a[field]) || 0;
    const bValue = Number(b[field]) || 0;

    return ranking.direction === "bottom"
      ? aValue - bValue
      : bValue - aValue;
  });

  return sorted.slice(0, count);
}
function useChartData({ data, chartConfig, settings }) {
  const processedData = useMemo(() => {
    const yKeys = Array.isArray(chartConfig.y)
      ? chartConfig.y
      : chartConfig.y
        ? [chartConfig.y]
        : [];

    if (!data || !chartConfig.x || yKeys.length === 0) {
      return [];
    }

    let result = aggregateData(
      data,
      chartConfig.x,
      yKeys,
      chartConfig.aggregation
    );

    result = sortData(
      result,
      chartConfig.sorting,
      yKeys
    );

    result = applyRanking(
      result,
      chartConfig.ranking,
      yKeys
    );

    return result;
  }, [
    data,
    chartConfig.x,
    chartConfig.y,
    chartConfig.aggregation,
    chartConfig.sorting,
    chartConfig.ranking,
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