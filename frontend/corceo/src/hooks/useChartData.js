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

function applyFilters(rawData, filters = []) {
  if (!Array.isArray(filters) || filters.length === 0) {
    return rawData;
  }

  return rawData.filter((row) => {
    return filters.every((filter) => {
      const rowValue = row[filter.field];
      const filterValue = filter.value;

      switch (filter.operator) {
        case "equals":
          return (
            String(rowValue ?? "").trim().toLowerCase() ===
            String(filterValue ?? "").trim().toLowerCase()
          );

        case "notEquals":
          return (
            String(rowValue ?? "").trim().toLowerCase() !==
            String(filterValue ?? "").trim().toLowerCase()
          );

        case "contains":
          return String(rowValue ?? "")
            .toLowerCase()
            .includes(
              String(filterValue ?? "").toLowerCase()
            );

        case "greaterThan":
          return (
            parseNumericValue(rowValue) >
            parseNumericValue(filterValue)
          );

        case "greaterThanOrEqual":
          return (
            parseNumericValue(rowValue) >=
            parseNumericValue(filterValue)
          );

        case "lessThan":
          return (
            parseNumericValue(rowValue) <
            parseNumericValue(filterValue)
          );

        case "lessThanOrEqual":
          return (
            parseNumericValue(rowValue) <=
            parseNumericValue(filterValue)
          );

        case "between": {
          const min = parseNumericValue(filter.min);
          const max = parseNumericValue(filter.max);
          const value = parseNumericValue(rowValue);

          return value >= min && value <= max;
        }

        case "in": {
          const selectedValues = Array.isArray(filter.value)
            ? filter.value
            : [];

          return selectedValues.some(
            (selectedValue) =>
              String(selectedValue ?? "")
                .trim()
                .toLowerCase() ===
              String(rowValue ?? "")
                .trim()
                .toLowerCase()
          );
        }

        default:
          return true;
      }
    });
  });
}
function aggregateData(
  rawData,
  xField,
  yFields,
  mode = "none",
  tooltipExtraFields = []
) {
  const yKeys = Array.isArray(yFields)
    ? yFields
    : yFields
      ? [yFields]
      : [];

  const extraFields = Array.isArray(tooltipExtraFields)
    ? tooltipExtraFields
    : [];

  /*
   * No aggregation:
   * preserve the extra tooltip values directly from each row.
   */
  if (mode === "none") {
    return rawData.map((row) => {
      const result = {
        x: row[xField],
      };

      yKeys.forEach((key) => {
        result[key] = parseNumericValue(row[key]);
      });

      extraFields.forEach((field) => {
        result[field] = row[field] ?? null;
      });

      return result;
    });
  }

  /*
   * Aggregation:
   * store all original rows belonging to each X category.
   */
  const groupedData = new Map();

  rawData.forEach((row) => {
    const xValue = row[xField];

    if (!groupedData.has(xValue)) {
      groupedData.set(xValue, {
        valuesByKey: {},
        sourceRows: [],
      });
    }

    const group = groupedData.get(xValue);

    group.sourceRows.push(row);

    yKeys.forEach((key) => {
      if (!group.valuesByKey[key]) {
        group.valuesByKey[key] = [];
      }

      group.valuesByKey[key].push(
        parseNumericValue(row[key])
      );
    });
  });

  return Array.from(groupedData.entries()).map(
    ([xValue, group]) => {
      const result = {
        x: xValue,
      };

      yKeys.forEach((key) => {
        const values =
          group.valuesByKey[key] || [];

        if (values.length === 0) {
          result[key] = 0;
          return;
        }

        switch (mode) {
          case "avg":
            result[key] =
              values.reduce(
                (sum, value) => sum + value,
                0
              ) / values.length;
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

      /*
       * Combine unique tooltip values from all rows
       * belonging to the aggregated X category.
       */
      extraFields.forEach((field) => {
        const uniqueValues = [
          ...new Set(
            group.sourceRows
              .map((row) => row[field])
              .filter(
                (value) =>
                  value !== null &&
                  value !== undefined &&
                  value !== ""
              )
              .map((value) => String(value))
          ),
        ];

        result[field] =
          uniqueValues.length > 0
            ? uniqueValues.join(", ")
            : null;
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

  
const filteredRawData = applyFilters(
  data,
  chartConfig.filters
);

const tooltipExtraFields =
  settings.tooltipExtraFields ?? [];

let rows = aggregateData(
  filteredRawData,
  chartConfig.x,
  yKeys,
  chartConfig.aggregation,
  tooltipExtraFields
);

const filteredYKeys = yKeys;

if (settings.hideZeros) {
  rows = rows.filter((row) =>
    filteredYKeys.some(
      (key) =>
        parseNumericValue(row[key]) !== 0
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
  chartConfig.filters,
  settings.hideZeros,
  settings.tooltipExtraFields,
]);


const generatedColors = useMemo(() => {
  const colorCount = Math.max(
    processed.visibleYKeys.length,
    processed.rows.length,
    1
  );

  const sequentialCharts = [
    "heatmap",
    "waterfall",
  ];

  const isSequential =
    sequentialCharts.includes(
      chartConfig.type
    );

  return generatePalette(
    settings.palette ?? "Standard",
    settings.paletteMode ?? "automatic",
    colorCount,
    {
      useCustomPalette:
        settings.useCustomPalette ?? false,

      customColors:
        settings.customPalette ?? [],

      extendCustomPalette:
        settings.extendCustomPalette ?? true,

      customExtensionMode:
        settings.customExtensionMode ?? "distinct",

      ordered: isSequential,
    }
  );
}, [
  settings.palette,
  settings.paletteMode,
  settings.useCustomPalette,
  settings.customPalette,
  settings.extendCustomPalette,
  settings.customExtensionMode,
  chartConfig.type,
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