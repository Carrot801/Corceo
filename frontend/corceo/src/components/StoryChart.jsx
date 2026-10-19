import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { StoryChartScaleContext } from "../context/StoryChartScaleContext";
import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData";
import { apiRequest } from "../api/client";

const EMPTY_ROWS = [];

function parseJsonValue(value, fallback) {
  if (value == null) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function StoryChartScaler({ children }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const CHART_WIDTH = 1200;
  const CHART_HEIGHT = 760;

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateScale = () => {
      const rect = element.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const nextScale = Math.min(
        rect.width / CHART_WIDTH,
        rect.height / CHART_HEIGHT
      );

      setScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <StoryChartScaleContext.Provider value={scale}>
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-visible"
      >
        <div
          style={{
            width: `${CHART_WIDTH}px`,
            height: `${CHART_HEIGHT}px`,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          {children}
        </div>
      </div>
    </StoryChartScaleContext.Provider>
  );
}

function StoryChart({
  tooltipPortal = null,
  chartId,
  storyMode = false,
  initialChart = null,
  initialRows = null,
  exportMode = false,
}) {
  const [loadState, setLoadState] = useState({
    chartId: null,
    chart: null,
    rows: EMPTY_ROWS,
    status: "idle",
    error: null,
  });

  const hasInitialChart = initialChart != null;
  const hasChartId = chartId != null && chartId !== "";
  const loadedForCurrentChart = loadState.chartId === chartId;

  useEffect(() => {
    if (hasInitialChart || !hasChartId) {
      return;
    }

    let cancelled = false;

    const loadChart = async () => {
      setLoadState({
        chartId,
        chart: null,
        rows: EMPTY_ROWS,
        status: "loading",
        error: null,
      });

      try {
        const chartData = await apiRequest(`/charts/${chartId}`);

        if (cancelled) {
          return;
        }

        if (!chartData) {
          throw new Error("Chart not found.");
        }

        let rows = EMPTY_ROWS;

        if (chartData.dataset_id) {
          const datasetRows = await apiRequest(
            `/data/rows?dataset_id=${encodeURIComponent(
              chartData.dataset_id
            )}`
          );

          if (cancelled) {
            return;
          }

          const rowsArray = Array.isArray(datasetRows)
            ? datasetRows
            : Array.isArray(datasetRows?.rows)
              ? datasetRows.rows
              : EMPTY_ROWS;

          rows = rowsArray.map((row) => row?.data ?? row);
        }

        if (cancelled) {
          return;
        }

        setLoadState({
          chartId,
          chart: chartData,
          rows,
          status: "ready",
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load story chart:", error);

        setLoadState({
          chartId,
          chart: null,
          rows: EMPTY_ROWS,
          status: "error",
          error: error.message || "Failed to load chart.",
        });
      }
    };

    loadChart();

    return () => {
      cancelled = true;
    };
  }, [chartId, hasChartId, hasInitialChart]);

  const chart = hasInitialChart
    ? initialChart
    : loadedForCurrentChart
      ? loadState.chart
      : null;

  const rows = hasInitialChart
    ? Array.isArray(initialRows)
      ? initialRows
      : EMPTY_ROWS
    : loadedForCurrentChart
      ? loadState.rows
      : EMPTY_ROWS;

  const status = hasInitialChart
    ? "ready"
    : !hasChartId
      ? "error"
      : !loadedForCurrentChart || loadState.status === "idle"
        ? "loading"
        : loadState.status;

  const errorMessage = !hasChartId
    ? "Chart not found."
    : loadState.error || "Failed to load chart.";

  const parsedSettings = useMemo(
    () => parseJsonValue(chart?.settings, {}),
    [chart?.settings]
  );

  const savedConfig = useMemo(
    () => parseJsonValue(chart?.chart_config, {}),
    [chart?.chart_config]
  );

  const parsedY = useMemo(
    () => parseJsonValue(chart?.y_axis, []),
    [chart?.y_axis]
  );

  const chartConfig = useMemo(
    () => ({
      ...savedConfig,

      x: savedConfig.x || chart?.x_axis || null,

      y:
        savedConfig.y ||
        (Array.isArray(parsedY)
          ? parsedY
          : parsedY
            ? [parsedY]
            : []),

      type: savedConfig.type || chart?.chart_type || "bar",

      aggregation:
        savedConfig.aggregation ||
        parsedSettings.aggregation ||
        "none",

      sort: savedConfig.sort || parsedSettings.sort || "none",

      appearance: {
        ...(savedConfig.appearance || {}),
      },

      limit: savedConfig.limit ?? null,
      sortBy: savedConfig.sortBy ?? null,
      timeGroupBy: savedConfig.timeGroupBy ?? "none",
      groupSmallCategories: savedConfig.groupSmallCategories ?? false,
      filterField: savedConfig.filterField ?? null,
      xHierarchy: savedConfig.xHierarchy ?? [],
      dateHierarchySource: savedConfig.dateHierarchySource ?? null,
    }),
    [
      savedConfig,
      parsedSettings,
      parsedY,
      chart?.x_axis,
      chart?.chart_type,
    ]
  );

  const previewSettings = useMemo(
    () => ({
      ...parsedSettings,
      exportMode,
    }),
    [parsedSettings, exportMode]
  );

  const {
    chartData,
    generatedColors,
    visibleYKeys,
  } = useChartData({
    data: rows,
    chartConfig,
    settings: parsedSettings,
  });

  if (status === "loading") {
    return (
      <div
        data-chart-status="loading"
        className="app-text-muted flex h-full w-full items-center justify-center text-sm"
      >
        Loading chart...
      </div>
    );
  }

  if (status === "error" || !chart) {
    return (
      <div
        data-chart-status="error"
        className="flex h-full w-full items-center justify-center p-4"
      >
        <p className="text-sm text-[rgb(var(--color-danger))]">
          {errorMessage}
        </p>
      </div>
    );
  }

  const preview = (
    <ChartPreview
      chartData={chartData}
      chartConfig={chartConfig}
      generatedColors={generatedColors}
      visibleYKeys={visibleYKeys}
      rawData={rows}
      settings={previewSettings}
      storyMode={storyMode}
      tooltipPortal={tooltipPortal}
    />
  );

  if (storyMode) {
    return (
      <div
        data-chart-status="ready"
        className="relative h-full w-full overflow-visible"
      >
        <StoryChartScaler>{preview}</StoryChartScaler>
      </div>
    );
  }

  return (
    <div
      data-chart-status="ready"
      className="h-full min-h-0 w-full"
    >
      {preview}
    </div>
  );
}

export default StoryChart;