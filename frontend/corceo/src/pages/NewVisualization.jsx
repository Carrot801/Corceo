import { useRef, useState,useEffect } from "react";
import {toPng} from "html-to-image";
import { useParams,useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import DataTable from "../components/data/DataTable";
import ChartPreview from "../components/charts/ChartPreview";
import FieldsPanel from "../components/data/FieldsPanel";
import useProjectData from "../hooks/useProjectData";
import useChartData from "../hooks/useChartData";

function NewVisualization() {
  const { id } = useParams();

  const chartRef = useRef(null);
  const navigate = useNavigate();
  const {
    data,
    setData,
    columns,
    datasetId,
    savedChart,
    setColumns,
    uploadCSV,
    saveChartToBackend,
    saveDataset,
  } = useProjectData(id);

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(`activeTab-${id}`) || "data"
  );  
  const [settings, setSettings] = useState({
    title: "",
    subtitle: "",
    description: "",

    headerAlign: "left",

    palette: "Standard",
    paletteMode: "repeat",
    extendPalette: false,

    showLegend: true,
    showGrid: true,

    legendPosition: "right",
  legendDirection: "column",
  legendAlign: "center",
  legendSize: "medium",
  legendTitle: "",
  legendGap: 12,
  });
  const [chartConfig, setChartConfig] = useState({
    x: null,
    y: null,
    type: "bar",
    aggregation: "none",
    sort: "none",
  });

  const exportPNG = async () => {
    if (!chartRef.current) return;

    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        pixelRatio: 2, // sharper export
      });

      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleDropAxis = (axis) => (e) => {
    const col = e.dataTransfer.getData("col");

    setChartConfig((prev) => ({
      ...prev,
      [axis]: col,
    }));
  };

  const {
    chartData,
    generatedColors,
  } = useChartData({
    data,
    chartConfig,
    settings,
  });

  const saveChart = async () => {
    await saveChartToBackend({
      dataset_id: datasetId,
      chart_type: chartConfig.type,
      x_axis: chartConfig.x,
      y_axis: chartConfig.y,
      settings: {
        ...settings,
        aggregation: chartConfig.aggregation,
        sort: chartConfig.sort
      }
    });
    console.log("saved", chartConfig);
  };

  const publishChart = async () => {
    try {
      const saved = await saveChartToBackend({
        dataset_id: datasetId,
        chart_type: chartConfig.type,
        x_axis: chartConfig.x,
        y_axis: chartConfig.y,
        settings: {
          ...settings,
          aggregation: chartConfig.aggregation,
          sort: chartConfig.sort,
        },
      });

      if (!saved?.id) {
        alert("Failed to publish chart");
        return;
      }

      navigate(`/published/${saved.id}`);

    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    localStorage.setItem(`activeTab-${id}`, activeTab);
  }, [activeTab, id]);
  useEffect(() => {
    if (!savedChart) return;

    const settings =
      typeof savedChart.settings === "string"
        ? JSON.parse(savedChart.settings)
        : savedChart.settings || {};

    setChartConfig({
      x: savedChart.x_axis,
      y: savedChart.y_axis,
      type: savedChart.chart_type || "bar",
      aggregation: settings.aggregation || "none",
      sort: settings.sort || "none",
    });

    setSettings(prev => ({
      ...prev,
      ...settings,
    }));

  }, [savedChart]);
  return (
    <div className="w-screen h-screen flex flex-col">

      {/* HEADER */}
      <div className="flex border-b bg-white">

        <button
          onClick={() => setActiveTab("data")}
          className={`px-4 py-2 ${
            activeTab === "data" && "bg-slate-100"
          }`}
        >
          Data
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 ${
            activeTab === "preview" && "bg-slate-100"
          }`}
        >
          Preview
        </button>

        {activeTab === "data" ? (
          <button
            onClick={saveDataset}
            className="ml-auto px-4 py-2 bg-green-600 text-white"
          >
            Save Data
          </button>
        ) : (
          <div className="ml-auto flex gap-2">

            <button
              onClick={publishChart}
              className="px-4 py-2 bg-emerald-600 text-white"
            >
              Publish
            </button>

            <button
              onClick={exportPNG}
              className="px-4 py-2 bg-purple-600 text-white"
            >
              Export PNG
            </button>

            <button
              onClick={saveChart}
              className="px-4 py-2 bg-blue-600 text-white"
            >
              Save Chart
            </button>

          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">

      {activeTab === "data" ? (
        <DataTable
          data={data}
          setData={setData}
          columns={columns}
          setColumns={setColumns}
          uploadCSV={uploadCSV}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">

    <div className="w-64 border-r bg-white">
      <FieldsPanel
        columns={columns}
        onDragStart={(e, col) => {
          e.dataTransfer.setData("col", col);
        }}
      />
    </div>

    <div className="flex-1 p-4 bg-slate-50 overflow-hidden">

      <div className="mb-4 space-y-2 shrink-0">
        
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropAxis("x")}
          className="
            p-3
            border-2
            border-dashed
            rounded-lg
            bg-black/5
            text-slate-600
          "
        >
          X Axis: {chartConfig.x || "Drop field here"}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropAxis("y")}
          className="
            p-3
            border-2
            border-dashed
            rounded-lg
            bg-black/5
            text-slate-600
          "
        >
          Y Axis: {chartConfig.y || "Drop field here"}
        </div>

        <div 
        ref={chartRef}
        className="flex-1 border rounded-lg bg-white p-4"
        >
          <div className="w-full h-[600px]">
            <ChartPreview
            chartData={chartData}
            chartConfig={chartConfig}
            setChartConfig={setChartConfig}
            columns={columns}
            generatedColors={generatedColors}
            settings={settings}
            />
          </div>
          
  
        </div>
      </div>
      
    </div>

    <Sidebar
      settings={settings}
      updateSetting={updateSetting}
      chartConfig={chartConfig}
      setChartConfig={setChartConfig}
    />

  </div>
      )}
    </div>
    </div>
  );
}

export default NewVisualization;