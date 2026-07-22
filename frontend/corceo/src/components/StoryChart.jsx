import { useEffect, useState } from "react";
import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData";

function StoryChart({ chartId }) {
  const [chart, setChart] = useState(null);
  const [rows, setRows] = useState([]);


  const loadChart = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      const chartRes = await fetch(
        `http://localhost:5000/charts/${chartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const chartData = await chartRes.json();
      console.log("Chart DatDDDDDDDDDDDa:", chartData);

      setChart(chartData);

      const rowsRes = await fetch(
          `http://localhost:5000/data/rows?dataset_id=${chartData.dataset_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
      );

      const datasetRows = await rowsRes.json();


      const rowsArray =
        Array.isArray(datasetRows)
          ? datasetRows
          : Array.isArray(datasetRows?.rows)
          ? datasetRows.rows
          : [];

      setRows(
        rowsArray.map(r => r?.data ?? r)
      );

    } catch (err) {
      console.error(err);
    }
  };
    
  
  useEffect(() => {
    loadChart();
  }, [chartId]);

  
const parsedSettings =
  typeof chart?.settings === "string"
    ? JSON.parse(chart.settings)
    : chart?.settings || {};

const savedConfig =
  typeof chart?.chart_config === "string"
    ? JSON.parse(chart.chart_config)
    : chart?.chart_config || {};

const parsedY = chart?.y_axis
  ? typeof chart.y_axis === "string"
    ? JSON.parse(chart.y_axis)
    : chart.y_axis
  : [];

const chartConfig = {
  ...savedConfig,

  
  x: savedConfig.x || chart?.x_axis || null,

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
    ...(savedConfig.appearance || {}),
  },

  limit: savedConfig.limit || null,
  sortBy: savedConfig.sortBy || null,
  timeGroupBy: savedConfig.timeGroupBy || "none",
  groupSmallCategories:
    savedConfig.groupSmallCategories || false,
  filterField: savedConfig.filterField || null,
  xHierarchy: savedConfig.xHierarchy || [],
  dateHierarchySource:
    savedConfig.dateHierarchySource || null,
};


  const {
    chartData,
    generatedColors,
    visibleYKeys,
  } = useChartData({
    data: rows,
    chartConfig,
    settings: parsedSettings,
  });


  if (!chart) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }


  

  return (
    <div className="w-full h-full min-h-0 ">
      <ChartPreview
        chartData={chartData}
        chartConfig={chartConfig}
        generatedColors={generatedColors}
        visibleYKeys={visibleYKeys}
        rawData={rows}
        settings={{
          ...parsedSettings,
          showLegend: false,
          title: "",
          subtitle: "",
          description: "",
        }}
      />
    </div>
  );
}

export default StoryChart;