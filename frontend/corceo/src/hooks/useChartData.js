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

function applyDateRange(
  rawData,
  dateRange
) {
  if (
    !dateRange?.field ||
    (!dateRange?.from && !dateRange?.to)
  ) {
    return rawData;
  }

  const field = dateRange.field;

  const fromDate =
    dateRange.from
      ? new Date(`${dateRange.from}T00:00:00`)
      : null;

  const toDate =
    dateRange.to
      ? new Date(`${dateRange.to}T23:59:59.999`)
      : null;

  return rawData.filter((row) => {
    const rawValue = row[field];

    if (
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ""
    ) {
      return false;
    }

    const rowDate = new Date(rawValue);

    if (Number.isNaN(rowDate.getTime())) {
      return false;
    }

    if (
      fromDate &&
      rowDate < fromDate
    ) {
      return false;
    }

    if (
      toDate &&
      rowDate > toDate
    ) {
      return false;
    }

    return true;
  });
}

function groupDateData(
  rawData,
  grouping
) {
  if (
    !grouping?.enabled ||
    !grouping?.field ||
    !grouping?.unit
  ) {
    return rawData;
  }

  const {
    field,
    unit,
  } = grouping;

  return rawData.map((row) => {
    const rawValue = row[field];

    if (
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ""
    ) {
      return row;
    }

    const date = new Date(rawValue);

    if (Number.isNaN(date.getTime())) {
      return row;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let groupedValue;

    switch (unit) {
      case "day": {
        groupedValue =
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        break;
      }

      case "week": {
        const start = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        const weekday =
          start.getDay() || 7;

        start.setDate(
          start.getDate() -
            weekday +
            1
        );

        groupedValue =
          `${start.getFullYear()}-${String(
            start.getMonth() + 1
          ).padStart(2, "0")}-${String(
            start.getDate()
          ).padStart(2, "0")}`;

        break;
      }

      case "quarter": {
        const quarter =
          Math.floor(
            (month - 1) / 3
          ) + 1;

        groupedValue =
          `${year} Q${quarter}`;

        break;
      }

      case "year": {
        groupedValue =
          String(year);

        break;
      }

      case "month":
      default: {
        groupedValue =
          `${year}-${String(month).padStart(
            2,
            "0"
          )}`;

        break;
      }
    }

    return {
      ...row,
      [field]: groupedValue,
    };
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

const rangeFilteredData =
  applyDateRange(
    filteredRawData,
    chartConfig.dateRange
  );

const groupedRawData = groupDateData(
  rangeFilteredData,
  chartConfig.grouping
);

const tooltipExtraFields =
  settings.tooltipExtraFields ?? [];

const xField =
  chartConfig.grouping?.enabled &&
  chartConfig.grouping?.field
    ? chartConfig.grouping.field
    : chartConfig.x;

const aggregationMode =
  chartConfig.grouping?.enabled
    ? "sum"
    : chartConfig.aggregation;

let rows = aggregateData(
  groupedRawData,
  xField,
  yKeys,
  aggregationMode,
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
  chartConfig.grouping,
  chartConfig.dateRange,
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