import { useMemo } from "react";
import { generatePalette } from "../custom/colorPallets";

function parseNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/[$€£]/g, "")
    .replace(/%$/, "");

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

function aggregateData(rawData, xField, yFields, mode = "none") {
  const yKeys = Array.isArray(yFields)
    ? yFields
    : yFields
      ? [yFields]
      : [];

  if (mode === "none") {
    return rawData.map((row) => {
      const result = {
        x: row[xField],
      };

      yKeys.forEach((key) => {
        result[key] = parseNumericValue(row[key]);
      });

      return result;
    });
  }

  const groupedData = new Map();

  rawData.forEach((row) => {
    const xValue = row[xField];

    if (!groupedData.has(xValue)) {
      groupedData.set(xValue, {});
    }

    const group = groupedData.get(xValue);

    yKeys.forEach((key) => {
      if (!group[key]) {
        group[key] = [];
      }

      group[key].push(parseNumericValue(row[key]));
    });
  });

  return Array.from(groupedData.entries()).map(
    ([xValue, valuesByKey]) => {
      const result = {
        x: xValue,
      };

      yKeys.forEach((key) => {
        const values = valuesByKey[key] || [];

        if (values.length === 0) {
          result[key] = 0;
          return;
        }

        switch (mode) {
          case "avg":
            result[key] =
              values.reduce((sum, value) => sum + value, 0) /
              values.length;
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
            result[key] = values.reduce(
              (sum, value) => sum + value,
              0
            );
            break;
        }
      });

      return result;
    }
  );
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

  if (!field) {
    return chartRows;
  }

  return [...chartRows].sort((a, b) => {
    const aValue = field === "x" ? a.x : a[field];
    const bValue = field === "x" ? b.x : b[field];

    const aNumber = Number(aValue);
    const bNumber = Number(bValue);

    let comparison;

    if (
      Number.isFinite(aNumber) &&
      Number.isFinite(bNumber)
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
  const count = Math.max(
    1,
    Number(ranking.count) || 10
  );

  if (!field) {
    return chartRows.slice(0, count);
  }

  const sorted = [...chartRows].sort((a, b) => {
    const aValue = parseNumericValue(a[field]);
    const bValue = parseNumericValue(b[field]);

    return ranking.direction === "bottom"
      ? aValue - bValue
      : bValue - aValue;
  });

  return sorted.slice(0, count);
}

function useChartData({ data, chartConfig, settings }) {
  const processed = useMemo(() => {
    const yKeys = Array.isArray(chartConfig.y)
      ? chartConfig.y
      : chartConfig.y
        ? [chartConfig.y]
        : [];

    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      !chartConfig.x ||
      yKeys.length === 0
    ) {
      return {
        rows: [],
        visibleYKeys: [],
      };
    }

    let rows = aggregateData(
      data,
      chartConfig.x,
      yKeys,
      chartConfig.aggregation
    );

    const filteredYKeys = yKeys;

    if (settings.hideZeros) {
      rows = rows.filter((row) =>
        filteredYKeys.some(
          (key) => parseNumericValue(row[key]) !== 0
        )
      );
    }

    rows = sortData(
      rows,
      chartConfig.sorting,
      filteredYKeys
    );

    rows = applyRanking(
      rows,
      chartConfig.ranking,
      filteredYKeys
    );

    return {
      rows,
      visibleYKeys: filteredYKeys,
    };
  }, [
    data,
    chartConfig.x,
    chartConfig.y,
    chartConfig.aggregation,
    chartConfig.sorting,
    chartConfig.ranking,
    settings.hideZeros,
  ]);

  const generatedColors = useMemo(() => {
    const colorCount = Math.max(
      processed.visibleYKeys.length,
      processed.rows.length,
      1
    );

    return generatePalette(
      settings.palette,
      settings.paletteMode,
      colorCount
    );
  }, [
    settings.palette,
    settings.paletteMode,
    processed.visibleYKeys.length,
    processed.rows.length,
  ]);

  return {
    chartData: processed.rows,
    generatedColors,
    visibleYKeys: processed.visibleYKeys,
  };
}

export default useChartData;