import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData";

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

function PublishedChart() {
  const { chartId } = useParams();

  const [chart, setChart] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const parsedSettings = useMemo(() => {
    return safeParse(chart?.settings, {});
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
      /*
       * Start with the complete saved config.
       * This restores appearance.xAxis, appearance.yAxis,
       * bar settings, pie radius settings, and everything else.
       */
      ...savedChartConfig,

      /*
       * Use fallback database columns when older charts
       * do not contain x, y, or type in chart_config.
       */
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
        parsedSettings.aggregation ??
        "none",

      sort:
        savedChartConfig.sort ??
        parsedSettings.sort ??
        "none",

      /*
       * Make sure appearance always exists.
       */
      appearance: {
        ...(savedChartConfig.appearance || {}),
      },
    };
  }, [
    chart,
    parsedY,
    parsedSettings,
    savedChartConfig,
  ]);

  useEffect(() => {
    const loadChart = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found.");
        }

        const chartResponse = await fetch(
          `http://localhost:5000/charts/${chartId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!chartResponse.ok) {
          throw new Error(
            `Failed to load chart: ${chartResponse.status}`,
          );
        }

        const chartResult = await chartResponse.json();

        setChart(chartResult);

        const rowsResponse = await fetch(
          `http://localhost:5000/data/rows?dataset_id=${chartResult.dataset_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!rowsResponse.ok) {
          throw new Error(
            `Failed to load chart data: ${rowsResponse.status}`,
          );
        }

        const datasetRows = await rowsResponse.json();

        const rowsArray = Array.isArray(datasetRows)
          ? datasetRows
          : Array.isArray(datasetRows?.rows)
            ? datasetRows.rows
            : [];

        const cleanRows = rowsArray.map((row) => {
          return row?.data ?? row;
        });

        setRows(cleanRows);
      } catch (error) {
        console.error(
          "Failed to load published chart resources:",
          error,
        );

        setLoadError(
          error.message || "Failed to load published chart.",
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
    data: rows,
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
    <div className="app-page min-h-screen p-8">
      <div
        className="
          app-card
          mx-auto h-[720px] w-full max-w-6xl
          rounded-xl p-6
        "
      >
        <ChartPreview
          chartData={chartData}
          rawData={rows}
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
