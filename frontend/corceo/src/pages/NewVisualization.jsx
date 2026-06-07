import React, { useRef, useState,useEffect } from "react";
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


  const removeFieldFromAxis = (axis) => {
    setChartConfig((prev) => ({
      ...prev,
      [axis]: null,
    }));
  };
  const swapAxes = () => {
    setChartConfig((prev) => ({
      ...prev,
      x: prev.y,
      y: prev.x
    }));
  };
  const columnTypes = React.useMemo(() => {
    if (!data || data.length === 0) return {};
    
    const firstRow = data[0];
    const types = {};
    
    Object.keys(firstRow).forEach((key) => {
      const val = firstRow[key];
      // Simple logic: if it's a number or a string that looks like a number
      if (typeof val === 'number' || (!isNaN(val) && !isNaN(parseFloat(val)))) {
        types[key] = 'number';
      } else if (typeof val === 'string' && !isNaN(Date.parse(val)) && val.length > 5) {
        types[key] = 'date';
      } else {
        types[key] = 'string';
      }
    });
    
    return types;
  }, [data]);

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

  const node = chartRef.current;

  // Save original styles
  const originalWidth = node.style.width;
  const originalHeight = node.style.height;
  const originalOverflow = node.style.overflow;

  try {
    // Force fixed export size
    node.style.width = "1400px";
    node.style.height = "900px";
    node.style.overflow = "visible";

    // Wait for Recharts to re-render
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();

  } catch (err) {
    console.error("Export failed:", err);

  } finally {
    // Restore original styles
    node.style.width = originalWidth;
    node.style.height = originalHeight;
    node.style.overflow = originalOverflow;
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

  const isUsed = (col) => col === chartConfig.x || col === chartConfig.y;

  const saveChart = async () => {
    let base64Image = null;

    if (chartRef.current) {
      try {
        base64Image = await toPng(chartRef.current, {
          cacheBust: true,
          pixelRatio: 1, 
          width: 1400,  
          height: 600,
          style: {
            transform: 'none',
            overflow: 'visible',
          }
        });
      } catch (err) {
        console.error("Failed to generate background preview image:", err);
      }
    }
    console.log("Saving chart with ID:", datasetId);
    await saveChartToBackend({
      dataset_id: datasetId,
      chart_type: chartConfig.type,
      x_axis: chartConfig.x,
      y_axis: chartConfig.y,
      image_data: base64Image,
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
          datasetId={datasetId} 
          uploadCSV={uploadCSV}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">

    <div className="w-64 border-r bg-white">
      <FieldsPanel
        columns={columns}
        types={columnTypes}
        setChartConfig={setChartConfig}
        isUsed={isUsed}
        onDragStart={(e, col) => {
          e.dataTransfer.setData("col", col);
        }}

      />
    </div>

    <div className="flex-1 p-4 bg-slate-50 overflow-hidden">

      <div className="mb-4 space-y-2 w-full">
        <div className="flex gap-2 items-center mb-2">
          <button
            onClick={swapAxes}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm text-slate-700"
            title="Swap X and Y Axes"
          >
            ⇄ Swap Axes
          </button>
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropAxis("x")}
          className="p-3 border-2 border-dashed rounded-lg bg-black/5 text-slate-600 flex justify-between items-center"
        >
          <span>X Axis: {chartConfig.x || "Drop field here"}</span>
          
          {chartConfig.x && (
            <button 
              onClick={() => removeFieldFromAxis("x")}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              ✕
            </button>
          )}
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropAxis("y")}
          className="p-3 border-2 border-dashed rounded-lg bg-black/5 text-slate-600 flex justify-between items-center"
        >
          <span>Y Axis: {chartConfig.y || "Drop field here"}</span>
          
          {chartConfig.y && (
            <button 
              onClick={() => removeFieldFromAxis("y")}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              ✕
            </button>
          )}
        </div>
        <div
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
    <div
      style={{
        position: "fixed",
        left: "-99999px",
        top: 0,
        width: "auto",
        minHeight: "900px",
        background: "white",
        zIndex: -1,
        
          display: "inline-block",
      }}
    >
      <div
        ref={chartRef}
        style={{
          width: "1400px",
          minheight: "900px",
          padding: "40px",
          background: "white",
          display: "inline-block",
        }}
      >
        <ChartPreview
          chartData={chartData}
          chartConfig={chartConfig}
          setChartConfig={setChartConfig}
          columns={columns}
          generatedColors={generatedColors}
          settings={settings}
          exportMode={true}
        />
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