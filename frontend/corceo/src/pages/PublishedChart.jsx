import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData";
import { defaultChartConfig,defaultChartSettings } from "../components/config/chartDefaults";
import { apiRequest } from "../api/client";

function safeParse(value, fallback = {}) {
  if (!value) return fallback;

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse saved chart value:", error);
    return fallback;
  }
}

function addDateHierarchyFields(
  rows,
  dateHierarchySource
) {
  if (
    !Array.isArray(rows) ||
    !dateHierarchySource
  ) {
    return rows;
  }

  return rows.map((row) => {
    const rawDate = row?.[dateHierarchySource];
    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return row;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter =
      Math.floor((month - 1) / 3) + 1;

    return {
      ...row,

      [`${dateHierarchySource}_Year`]:
        String(year),

      [`${dateHierarchySource}_Quarter`]:
        `${year} Q${quarter}`,

      [`${dateHierarchySource}_Month`]:
        `${year}-${String(month).padStart(2, "0")}`,
    };
  });
}

function PublishedChart() {
  const { chartId } = useParams();

  const [chart, setChart] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

const parsedSettings = useMemo(() => {
  const savedSettings = safeParse(
    chart?.settings,
    {}
  );

  return {
    ...defaultChartSettings,
    ...savedSettings,
  };
}, [chart]);

  const savedChartConfig = useMemo(() => {
    return safeParse(chart?.chart_config, {});
  }, [chart]);

  const parsedY = useMemo(() => {
    const savedY =
      savedChartConfig.y ??
      safeParse(chart?.y_axis, []);

    if (Array.isArray(savedY)) {
      return savedY;
    }

    return savedY ? [savedY] : [];
  }, [chart, savedChartConfig]);

const chartConfig = useMemo(() => {
  return {
    ...defaultChartConfig,
    ...savedChartConfig,

    x:
      savedChartConfig.x ??
      chart?.x_axis ??
      null,

    y: parsedY,

    type:
      savedChartConfig.type ??
      chart?.chart_type ??
      "bar",

    aggregation:
      savedChartConfig.aggregation ??
      "none",

    sorting:
      savedChartConfig.sorting ?? {
        field: null,
        direction: "none",
      },

    ranking: {
      ...defaultChartConfig.ranking,
      ...(savedChartConfig.ranking || {}),
    },

    dateGrouping: {
      ...defaultChartConfig.dateGrouping,
      ...(savedChartConfig.dateGrouping || {}),
    },

    filters: Array.isArray(
      savedChartConfig.filters
    )
      ? savedChartConfig.filters
      : [],

    appearance: {
      ...defaultChartConfig.appearance,
      ...(savedChartConfig.appearance || {}),

      xAxis: {
        ...defaultChartConfig.appearance.xAxis,
        ...(savedChartConfig.appearance?.xAxis ||
          {}),
      },

      yAxis: {
        ...defaultChartConfig.appearance.yAxis,
        ...(savedChartConfig.appearance?.yAxis ||
          {}),
      },
    },

    xHierarchy: Array.isArray(
      savedChartConfig.xHierarchy
    )
      ? savedChartConfig.xHierarchy
      : [],

    dateHierarchySource:
      savedChartConfig.dateHierarchySource ??
      null,

    groupSmallCategories:
      savedChartConfig.groupSmallCategories ??
      false,

    timeGroupBy:
      savedChartConfig.timeGroupBy ?? "none",
  };
}, [
  chart,
  parsedY,
  savedChartConfig,
]);
const preparedRows = useMemo(() => {
  return addDateHierarchyFields(
    rows,
    chartConfig.dateHierarchySource
  );
}, [
  rows,
  chartConfig.dateHierarchySource,
]);
useEffect(() => {
  const loadChart = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const result =
        await apiRequest(
          `/charts/public/${chartId}`,
          {
            auth: false,
          }
        );

      setChart(
        result.chart
      );

      setRows(
        Array.isArray(result.rows)
          ? result.rows
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load published chart:",
        error
      );

      setLoadError(
        error.message ||
          "Failed to load published chart."
      );

    } finally {
      setLoading(false);
    }
  };

  loadChart();

}, [chartId]);

const {
  chartData,
  generatedColors,
  visibleYKeys,
} = useChartData({
  data: preparedRows,
  chartConfig,
  settings: parsedSettings,
});


  if (loading) {
    return (
      <div className="app-page flex min-h-screen items-center justify-center">
        <p className="app-text-muted font-medium">
          Loading interactive chart...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-page flex min-h-screen items-center justify-center p-6">
        <div className="app-card max-w-md rounded-xl p-6 text-center">
          <p className="text-[rgb(var(--color-danger))]">
            {loadError}
          </p>
        </div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="app-page flex min-h-screen items-center justify-center">
        <p className="app-text-muted">
          Chart not found.
        </p>
      </div>
    );
  }

  return (
    <div className="app-page min-h-screen p-6">
      <div
        className="
          app-card
          mx-auto
          h-[calc(100vh-48px)]
          min-h-[600px]
          w-full
          max-w-[1400px]
          rounded-xl
          p-6
        "
      >
        <ChartPreview
          chartData={chartData}
          rawData={preparedRows}
          chartConfig={chartConfig}
          generatedColors={generatedColors}
          visibleYKeys={visibleYKeys}
          settings={parsedSettings}
        />
      </div>
    </div>
  );
}

export default PublishedChart;
