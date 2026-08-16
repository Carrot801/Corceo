import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  StoryChartScaleContext,} from "../context/StoryChartScaleContext";
import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData";
import { apiRequest } from "../api/client";
function StoryChartScaler({
  children,
}) {
  const containerRef =
    useRef(null);

  const [scale, setScale] =
    useState(1);

  const CHART_WIDTH = 1200;
  const CHART_HEIGHT = 760;

  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) return;

    const updateScale = () => {
      const rect =
        element.getBoundingClientRect();

      if (
        !rect.width ||
        !rect.height
      ) {
        return;
      }

      const nextScale =
        Math.min(
          rect.width /
            CHART_WIDTH,
          rect.height /
            CHART_HEIGHT,
        );

      setScale(nextScale);
    };

    updateScale();

    const observer =
      new ResizeObserver(
        updateScale,
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

return (
  <StoryChartScaleContext.Provider
    value={scale}
  >
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

          transform: `
            translate(-50%, -50%)
            scale(${scale})
          `,

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
}) {
  const [chart, setChart] =
    useState(null);

  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    if (!chartId) {
      return;
    }

    let cancelled = false;

    const loadChart = async () => {
      try {
        setLoading(true);
        setError(null);

        const chartData =
          await apiRequest(
            `/charts/${chartId}`,
          );

        if (cancelled) {
          return;
        }

        setChart(chartData);

        if (
          !chartData?.dataset_id
        ) {
          setRows([]);
          return;
        }

        const datasetRows =
          await apiRequest(
            `/data/rows?dataset_id=${encodeURIComponent(
              chartData.dataset_id,
            )}`,
          );

        if (cancelled) {
          return;
        }

        const rowsArray =
          Array.isArray(
            datasetRows,
          )
            ? datasetRows
            : Array.isArray(
                  datasetRows?.rows,
                )
              ? datasetRows.rows
              : [];

        setRows(
          rowsArray.map(
            (row) =>
              row?.data ?? row,
          ),
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load story chart:",
          err,
        );

        setError(
          err.message ||
            "Failed to load chart.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChart();

    return () => {
      cancelled = true;
    };
  }, [chartId]);

  const parseJsonValue = (
    value,
    fallback,
  ) => {
    if (value == null) {
      return fallback;
    }

    if (
      typeof value !==
      "string"
    ) {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const parsedSettings =
    parseJsonValue(
      chart?.settings,
      {},
    );

  const savedConfig =
    parseJsonValue(
      chart?.chart_config,
      {},
    );

  const parsedY =
    parseJsonValue(
      chart?.y_axis,
      [],
    );

  const chartConfig = {
    ...savedConfig,

    x:
      savedConfig.x ||
      chart?.x_axis ||
      null,

    y:
      savedConfig.y ||
      (Array.isArray(parsedY)
        ? parsedY
        : parsedY
          ? [parsedY]
          : []),

    type:
      savedConfig.type ||
      chart?.chart_type ||
      "bar",

    aggregation:
      savedConfig.aggregation ||
      parsedSettings.aggregation ||
      "none",

    sort:
      savedConfig.sort ||
      parsedSettings.sort ||
      "none",

    appearance: {
      ...(
        savedConfig.appearance ||
        {}
      ),
    },

    limit:
      savedConfig.limit ??
      null,

    sortBy:
      savedConfig.sortBy ??
      null,

    timeGroupBy:
      savedConfig.timeGroupBy ??
      "none",

    groupSmallCategories:
      savedConfig
        .groupSmallCategories ??
      false,

    filterField:
      savedConfig.filterField ??
      null,

    xHierarchy:
      savedConfig.xHierarchy ??
      [],

    dateHierarchySource:
      savedConfig
        .dateHierarchySource ??
      null,
  };

  const {
    chartData,
    generatedColors,
    visibleYKeys,
  } = useChartData({
    data: rows,
    chartConfig,
    settings:
      parsedSettings,
  });

  if (loading) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Loading chart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <p className="text-sm text-[rgb(var(--color-danger))]">
          {error}
        </p>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="app-text-muted flex h-full w-full items-center justify-center text-sm">
        Chart not found.
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
  settings={{
    ...parsedSettings,
  }}

  storyMode={storyMode}
  tooltipPortal={tooltipPortal}
/>
  );

  if (storyMode) {
    return (
      <div className="relative h-full w-full overflow-visible">
        <StoryChartScaler>
          {preview}
        </StoryChartScaler>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      {preview}
    </div>
  );
}

export default StoryChart;