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

const removeFieldFromAxis = (axis, field) => {
  setChartConfig((prev) => {
    if (axis === "y") {
      return {
        ...prev,
        y: prev.y.filter((item) => item !== field),
      };
    }

    return {
      ...prev,
      [axis]: null,
    };
  });
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
    legendFields: [],
    labelType: "percentage",
    labelPosition: "inside", 
    showLabels: true,
    hideZeros: false,


    tooltipFields: ["name", "value"],

    formatMode: "decimal",
    compactNumbers: false,
    numberFormat: "default",
    decimalPlaces: 2,
  });
  const [chartConfig, setChartConfig] = useState({
  x: null,
  y: [],
  type: "bar",
  aggregation: "none",
  xHierarchy: [],
  dateHierarchySource: null,
  sort: "none",
  groupSmallCategories: false,
  filterField: null,

  timeGroupBy: "none",
  limit: null,
  sortBy: null,
});
    const multiYCharts = ["bar", "line", "area", "composed"];

  const isMultiYChart = multiYCharts.includes(chartConfig.type);
const exportPNG = async () => {
  if (!chartRef.current) return;

  const node = chartRef.current;

  // Store original styles to restore them later
  const originalStyle = {
    width: node.style.width,
    height: node.style.height,
    overflow: node.style.overflow,
    position: node.style.position,
    maxHeight: node.style.maxHeight
  };

  try {
    // 1. Force the node to expand to its full content height
    node.style.width = "1400px";
    node.style.height = "auto"; // Let it grow to fit the legend
    node.style.minHeight = "900px";
    node.style.overflow = "visible"; 
    node.style.position = "relative";
    node.style.maxHeight = "none";

    // 2. IMPORTANT: Wait for React/Recharts to re-render at this new height
    await new Promise((resolve) => setTimeout(resolve, 600));
console.log(
  chartRef.current.querySelector(".recharts-responsive-container")
    ?.getBoundingClientRect()
);
    // 3. Capture
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      // Ensure the canvas gets the full height of the element
      height: node.scrollHeight, 
    });

    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    // Restore styles
    Object.assign(node.style, originalStyle);
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

  setChartConfig((prev) => {
    if (axis === "y") {
      const multiYCharts = ["bar", "line", "area", "composed"];
      const isMultiYChart = multiYCharts.includes(prev.type);

      if (!isMultiYChart) {
        return {
          ...prev,
          y: [col],
        };
      }

      return {
        ...prev,
        y: prev.y.includes(col) ? prev.y : [...prev.y, col],
      };
    }

    return {
      ...prev,
      [axis]: col,
    };
  });
};

  const {
    chartData,
    generatedColors,
  } = useChartData({
    data,
    chartConfig,
    settings,
  });


  
const isUsed = (col) =>
  col === chartConfig.x || chartConfig.y.includes(col);

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
    
await saveDataset();

  await saveChartToBackend({
    dataset_id: datasetId,
    chart_type: chartConfig.type,
    x_axis: chartConfig.x,
    y_axis: JSON.stringify(chartConfig.y),
    settings: {
      ...settings,
      aggregation: chartConfig.aggregation,
      sort: chartConfig.sort,
    },
    chart_config: chartConfig,
  });
};

  const recreateDateHierarchy = (field) => {
  const newFields = [
    `${field}_Year`,
    `${field}_Quarter`,
    `${field}_Month`,
  ];

  setColumns((prev) => [...new Set([...prev, ...newFields])]);

  setData((prevData) =>
    prevData.map((row) => {
      const date = new Date(row[field]);
      if (isNaN(date)) return row;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const quarter = `Q${Math.floor((month - 1) / 3) + 1}`;

      return {
        ...row,
        [`${field}_Year`]: String(year),
        [`${field}_Quarter`]: `${year} ${quarter}`,
        [`${field}_Month`]: `${year}-${String(month).padStart(2, "0")}`,
      };
    })
  );
};
useEffect(() => {
  if (!data || data.length === 0) return;
  if (!chartConfig.dateHierarchySource) return;

  const field = chartConfig.dateHierarchySource;

  const newFields = [
    `${field}_Year`,
    `${field}_Quarter`,
    `${field}_Month`,
  ];

  const alreadyExists = newFields.every((f) => columns.includes(f));
  if (alreadyExists) return;

  setColumns((prev) => [...new Set([...prev, ...newFields])]);

  setData((prevData) =>
    prevData.map((row) => {
      const date = new Date(row[field]);
      if (isNaN(date)) return row;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const quarter = `Q${Math.floor((month - 1) / 3) + 1}`;

      return {
        ...row,
        [`${field}_Year`]: String(year),
        [`${field}_Quarter`]: `${year} ${quarter}`,
        [`${field}_Month`]: `${year}-${String(month).padStart(2, "0")}`,
      };
    })
  );
}, [chartConfig.dateHierarchySource, columns, data.length]);
  const publishChart = async () => {
    try {
      const saved = await saveChartToBackend({
        dataset_id: datasetId,
        chart_type: chartConfig.type,
        x_axis: chartConfig.x,
        y_axis: JSON.stringify(chartConfig.y),
        settings: {
          ...settings,
          aggregation: chartConfig.aggregation,
          sort: chartConfig.sort,
        },
      chart_config: chartConfig,

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
      console.log("Loaded savedChart:", savedChart);
  console.log("Loaded chart_config:", savedChart.chart_config);


   const settings =
  typeof savedChart.settings === "string"
    ? JSON.parse(savedChart.settings)
    : savedChart.settings || {};



const savedConfig =
  typeof savedChart.chart_config === "string"
    ? JSON.parse(savedChart.chart_config)
    : savedChart.chart_config || {};
    const inferredDateSource =
      savedConfig.dateHierarchySource ||
      (savedConfig.x?.endsWith("_Month")
        ? savedConfig.x.replace("_Month", "")
        : null);

      const inferredHierarchy = inferredDateSource
        ? [
            `${inferredDateSource}_Year`,
            `${inferredDateSource}_Quarter`,
            `${inferredDateSource}_Month`,
          ]
        : [];
  setChartConfig({
    x: savedConfig.x || savedChart.x_axis,

    y:
      savedConfig.y ||
      (() => {
        try {
          const parsed = JSON.parse(savedChart.y_axis);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return savedChart.y_axis ? [savedChart.y_axis] : [];
        }
      })(),

    type: savedConfig.type || savedChart.chart_type || "bar",

    aggregation: savedConfig.aggregation || "none",
    sort: savedConfig.sort || "none",

    xHierarchy: savedConfig.xHierarchy?.length
      ? savedConfig.xHierarchy
      : inferredHierarchy,

    dateHierarchySource: inferredDateSource,

    timeGroupBy: inferredDateSource
      ? "hierarchy"
      : savedConfig.timeGroupBy || "none",

    groupSmallCategories: savedConfig.groupSmallCategories || false,
    filterField: savedConfig.filterField || null,

    limit: savedConfig.limit || null,
    sortBy: savedConfig.sortBy || null,
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
        setColumns={setColumns}
        data={data}
        setData={setData}
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
          className="p-3 border-2 border-dashed rounded-lg bg-black/5 text-slate-600"
        >
          <div className="mb-2">
            Y Axis: {chartConfig.y.length ? "" : "Drop fields here"}
          </div>

          <div className="flex flex-wrap gap-2">
            {chartConfig.y.map((field) => (
              <span
                key={field}
                className="px-2 py-1 bg-white border rounded flex items-center gap-2"
              >
                {field}
                <button
                  onClick={() => removeFieldFromAxis("y", field)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
        <div
        className="flex-1 border rounded-lg bg-white p-4"
        >
          <div className="w-full h-[530px]">
            <ChartPreview
            chartData={chartData}
            rawData={data}
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
{/* HIDDEN EXPORT LAYER */}
<div
  style={{
    position: "fixed",
    left: "-99999px",
    top: 0,
    width: "auto",
    height: "auto", // Allows the system to stretch infinitely downwards
    background: "white",
    zIndex: -1,
    display: "inline-block",
  }}
>
  <div
    ref={chartRef}
    style={{
      width: "1400px",
      minHeight: "900px", // Fixed casing typo from 'minheight'
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
      settings={{ ...settings, exportMode: true }}
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