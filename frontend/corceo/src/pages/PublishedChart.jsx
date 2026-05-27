import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChartPreview from "../components/charts/ChartPreview";
import useChartData from "../hooks/useChartData"; // 1. Import your data-processing hook

function PublishedChart() {
  const { chartId } = useParams();

  const [chart, setChart] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadChart();
  }, []);

  const loadChart = async () => {
    try {
      const chartRes = await fetch(
        `http://localhost:5000/charts/${chartId}`
      );
      const chartData = await chartRes.json();
      setChart(chartData);

      const rowsRes = await fetch(
        `http://localhost:5000/data/rows?dataset_id=${chartData.dataset_id}`
      );
      const datasetRows = await rowsRes.json();
      
      const cleanRows = datasetRows.map(r => r.data ? r.data : r);
      setRows(cleanRows);

    } catch (err) {
      console.error("Failed to load published chart resources:", err);
    }
  };

  const parsedSettings = chart?.settings
    ? typeof chart.settings === "string"
      ? JSON.parse(chart.settings)
      : chart.settings
    : {};

  const chartConfig = {
    x: chart?.x_axis || null,
    y: chart?.y_axis || null,
    type: chart?.chart_type || "bar",
    aggregation: parsedSettings.aggregation || "none",
    sort: parsedSettings.sort || "none",
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
    <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl h-[600px] border border-slate-100 rounded-xl shadow-sm p-6 bg-white">
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