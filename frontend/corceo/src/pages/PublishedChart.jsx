import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData"; // 1. Import your data-processing hook

function PublishedChart() {
  const { chartId } = useParams();

  
  const [chart, setChart] = useState(null);
  const [rows, setRows] = useState([]);
  const parsedSettings = chart?.settings
    ? typeof chart.settings === "string"
      ? JSON.parse(chart.settings)
      : chart.settings
    : {};

    const parsedY = chart?.y_axis
      ? typeof chart.y_axis === "string"
        ? JSON.parse(chart.y_axis)
        : chart.y_axis
      : [];

    const chartConfig = {
      x: chart?.x_axis || null,
      y: Array.isArray(parsedY) ? parsedY : [parsedY],
      type: chart?.chart_type || "bar",
      aggregation: parsedSettings.aggregation || "none",
      sort: parsedSettings.sort || "none",
    };

  useEffect(() => {
    loadChart();
  }, []);
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

    const cleanRows = rowsArray.map(r => r?.data ?? r);

    setRows(cleanRows);

    } catch (err) {
      console.error("Failed to load published chart resources:", err);
    }
  };


  const { chartData, generatedColors } = useChartData({
    data: rows,
    chartConfig,
    settings: parsedSettings,
  });
  if (!chart) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
        Loading interactive chart...
      </div>
    );
  }

  return (
    <div className="min-h-screen h-[800px] bg-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl h-full min-h-screen border border-slate-100 rounded-xl shadow-sm p-6 bg-white">
        <ChartPreview
          chartData={chartData} 
          chartConfig={chartConfig}
          generatedColors={generatedColors} 
          settings={parsedSettings}
        />
      </div>
    </div>
  );
}

export default PublishedChart;