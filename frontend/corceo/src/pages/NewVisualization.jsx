import React, { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import DataTable from "../components/data/DataTable";
import ChartPreview from "../components/charts/ChartPreview";
import FieldsPanel from "../components/data/FieldsPanel";
import useProjectData from "../hooks/useProjectData";
import useChartData from "../hooks/useChartData";
import ChartFiltersPanel from "../components/charts/ChartFiltersPanel";
import Header from "../components/Header";
import ActiveFilterChips from "../components/ActiveFilterChips";
import { defaultChartConfig, defaultChartSettings } from "../components/config/chartDefaults";
import useHistoryState from "../hooks/useHistoryState";
import SheetSelectionDialog from "../components/SheetSelectionDialog";
import {apiRequest} from "../api/client";

function NewVisualization() {
  const { id } = useParams();

const visibleChartRef = useRef(null);
const exportChartRef = useRef(null);
const chartResizeRef = useRef({
  resizing: false,
  startY: 0,
  startHeight: 520,
  latestHeight: 520,
});

  const navigate = useNavigate();
  const {
    data,
    setData,
    columns,
    setColumns,
    datasetId,
    savedChart,

    saveDataset,
    saveChartToBackend,

    handleDataFile,

    excelImport,
    selectExcelSheet,
    confirmExcelSheet,
    cancelExcelImport,

    isUploadingFile,
    error,
    clearError,
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

const MIN_CHART_HEIGHT = 320;
const MAX_CHART_HEIGHT = 1200;

const getInitialChartHeight = () => {
  const storedValue =
    localStorage.getItem(
      `chart-height-${id}`,
    );

  if (storedValue === null) {
    return 520;
  }

  const parsedHeight =
    Number(storedValue);

  if (!Number.isFinite(parsedHeight)) {
    return 520;
  }

  return Math.max(
    MIN_CHART_HEIGHT,
    Math.min(
      MAX_CHART_HEIGHT,
      parsedHeight,
    ),
  );
};

  
  
const {
  state: visualizationState,
  setState: setVisualizationState,
  undo,
  redo,
  reset: resetVisualizationHistory,
  commit: commitVisualizationHistory,
  canUndo,
  canRedo,
} = useHistoryState(
  {
    settings:
      defaultChartSettings,

    chartConfig:
      defaultChartConfig,

    selectedChartValues: [],

    chartHeight: getInitialChartHeight(),
  },
  {
    maxHistory: 50,
  },
);
const setSettings = (
  nextValueOrUpdater,
  options,
) => {
  setVisualizationState(
    (current) => ({
      ...current,

      settings:
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              current.settings,
            )
          : nextValueOrUpdater,
    }),
    options,
  );
};

const setChartConfig = (
  nextValueOrUpdater,
  options,
) => {
  setVisualizationState(
    (current) => ({
      ...current,

      chartConfig:
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              current.chartConfig,
            )
          : nextValueOrUpdater,
    }),
    options,
  );
};

const setSelectedChartValues = (
  nextValueOrUpdater,
  options,
) => {
  setVisualizationState(
    (current) => ({
      ...current,

      selectedChartValues:
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              current.selectedChartValues,
            )
          : nextValueOrUpdater,
    }),
    options,
  );
};

const setChartHeight = (
  nextValueOrUpdater,
  options,
) => {
  setVisualizationState(
    (current) => ({
      ...current,

      chartHeight:
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              current.chartHeight,
            )
          : nextValueOrUpdater,
    }),
    options,
  );
};

  const {
  settings,
  chartConfig,
  selectedChartValues,
  chartHeight,
} = visualizationState;



  const updateSetting = (key, value) => {
  setSettings(prev => ({
    ...prev,
    [key]: value,
  }));
};


    const multiYCharts = ["bar", "line", "area", "composed"];

  const isMultiYChart = multiYCharts.includes(chartConfig.type);


const waitForExportRender = async () => {
  await document.fonts?.ready;

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 150);
      });
    });
  });
};

const createSafeFileName = (value) => {
  const safeName = String(value || "chart")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ");

  return safeName || "chart";
};

const createExportImage = async (pixelRatio = 2) => {
  const node = exportChartRef.current;

  if (!node) {
    throw new Error(
      "The export chart element was not found."
    );
  }

  await waitForExportRender();

  const width = 1400;
  const height = 900;

  return toPng(node, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: "#ffffff",
    width,
    height,
    canvasWidth: width * pixelRatio,
    canvasHeight: height * pixelRatio,

    style: {
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      maxWidth: "none",
      maxHeight: "none",
      overflow: "hidden",
      transform: "none",
      backgroundColor: "#ffffff",
    },

    filter: (element) => {
      return !element?.classList?.contains(
        "no-export"
      );
    },
  });
};


const exportPNG = async () => {
  try {
    if (!chartConfig.x) {
      throw new Error(
        "Select a field for the X axis before exporting."
      );
    }

    if (
      !Array.isArray(chartConfig.y) ||
      chartConfig.y.length === 0
    ) {
      throw new Error(
        "Select at least one field for the Y axis before exporting."
      );
    }

    if (
      !Array.isArray(chartData) ||
      chartData.length === 0
    ) {
      throw new Error(
        "There is no chart data to export."
      );
    }

    const dataUrl = await createExportImage(2);

    const link = document.createElement("a");

    link.download = `${createSafeFileName(
      settings.title
    )}.png`;

    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Export failed:", error);

    alert(
      error.message ||
        "The chart could not be exported."
    );
  }
};

const removeFilterValue = (
  filterIndex,
  valueToRemove
) => {
  setChartConfig((prev) => {
    const updatedFilters = (prev.filters || [])
      .map((filter, index) => {
        if (index !== filterIndex) {
          return filter;
        }

        const currentValues = Array.isArray(filter.value)
          ? filter.value
          : [filter.value];

        const remainingValues = currentValues.filter(
          (value) =>
            String(value) !== String(valueToRemove)
        );

        if (remainingValues.length === 0) {
          return null;
        }

        return {
          ...filter,
          value: remainingValues,
        };
      })
      .filter(Boolean);

    return {
      ...prev,
      filters: updatedFilters,
    };
  });
};
const handleChartResizeMove = (
  event,
) => {
  const resizeState =
    chartResizeRef.current;

  if (!resizeState.resizing) return;

  const difference =
    event.clientY -
    resizeState.startY;

  const nextHeight = Math.max(
    320,
    Math.min(
      1200,
      resizeState.startHeight +
        difference,
    ),
  );

  resizeState.latestHeight =
    nextHeight;

  setChartHeight(nextHeight, {
    record: false,
  });
};


const stopChartResize = () => {
  const resizeState =
    chartResizeRef.current;

  if (!resizeState.resizing) {
    return;
  }

  resizeState.resizing = false;

  const startHeight =
    resizeState.startHeight;

  const finalHeight =
    resizeState.latestHeight;

  if (
    startHeight !== finalHeight
  ) {
    commitVisualizationHistory(
      {
        ...visualizationState,
        chartHeight: startHeight,
      },
      {
        ...visualizationState,
        chartHeight: finalHeight,
      },
    );
  }

  document.removeEventListener(
    "mousemove",
    handleChartResizeMove,
  );

  document.removeEventListener(
    "mouseup",
    stopChartResize,
  );
};


const startChartResize = (
  event,
) => {
  event.preventDefault();

  chartResizeRef.current = {
    resizing: true,
    startY: event.clientY,
    startHeight: chartHeight,
    latestHeight: chartHeight,
  };

  document.addEventListener(
    "mousemove",
    handleChartResizeMove,
  );

  document.addEventListener(
    "mouseup",
    stopChartResize,
  );
};



useEffect(() => {
  return () => {
    document.removeEventListener(
      "mousemove",
      handleChartResizeMove,
    );

    document.removeEventListener(
      "mouseup",
      stopChartResize,
    );
  };
}, []);

const applyChartSelection = () => {
  if (!chartConfig.x || selectedChartValues.length === 0) {
    return;
  }

  setChartConfig((prev) => {
    const otherFilters = (prev.filters || []).filter(
      (filter) => filter.field !== prev.x
    );

    return {
      ...prev,
      filters: [
        ...otherFilters,
        {
          field: prev.x,
          operator: "in",
          value: selectedChartValues,
        },
      ],
    };
  });

  setSelectedChartValues([], { record: false });
};

const clearChartSelection = () => {
  setSelectedChartValues(
    [],
    {
      record: false,
    },
  );
};


const clearFilters = () => {
  setChartConfig((prev) => ({
    ...prev,
    filters: [],
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
    visibleYKeys,
  } = useChartData({
    data,
    chartConfig,
    settings,
  });


  
const isUsed = (col) =>
  col === chartConfig.x ||
  (
    Array.isArray(chartConfig.y) &&
    chartConfig.y.includes(col)
  );

  const validateChartBeforeSave = () => {
    if (!chartConfig.x) {
      throw new Error("Select a field for the X axis.");
    }

    if (
      !Array.isArray(chartConfig.y) ||
      chartConfig.y.length === 0
    ) {
      throw new Error(
        "Select at least one field for the Y axis."
      );
    }
  };

  const saveChart = async () => {
  let base64Image = null;

  try {
    base64Image =
      await createExportImage(1);
  } catch (error) {
    console.error(
      "Could not create preview:",
      error
    );
  }

  try {
    const savedDataset =
      await saveDataset();

    await saveChartToBackend({
      dataset_id:
        savedDataset.datasetId,

      chart_type:
        chartConfig.type,

      x_axis:
        chartConfig.x,

      y_axis:
        JSON.stringify(
          chartConfig.y
        ),

      settings,
      chart_config:
        chartConfig,

      image_data:
        base64Image,
    });
  } catch (error) {
    console.error(
      "Save chart failed:",
      error
    );
  }
};
const handleChartItemClick = (item) => {
  const clickedValue = item?.x;

  if (
    clickedValue === undefined ||
    clickedValue === null ||
    clickedValue === ""
  ) {
    return;
  }

  setSelectedChartValues(
  (current) => {
    const alreadySelected =
      current.some(
        (value) =>
          String(value) ===
          String(clickedValue),
      );

    if (alreadySelected) {
      return current.filter(
        (value) =>
          String(value) !==
          String(clickedValue),
      );
    }

    return [
      ...current,
      clickedValue,
    ];
  },
  {
    record: false,
  },
);
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
  const publishChart =
  async () => {
    try {
      // 1. Save latest dataset
      await saveDataset();

      // 2. Save latest chart configuration
      const saved =
        await saveChartToBackend(
          {
            dataset_id:
              datasetId,

            chart_type:
              chartConfig.type,

            x_axis:
              chartConfig.x,

            y_axis:
              JSON.stringify(
                chartConfig.y,
              ),

            settings,

            chart_config:
              chartConfig,
          },
        );

      if (!saved?.id) {
        throw new Error(
          "Chart could not be saved before publishing.",
        );
      }

      // 3. Explicitly publish it
      await apiRequest(
        `/charts/${saved.id}/publish`,
        {
          method: "PUT",
        },
      );

      // 4. Go to public page
      navigate(
        `/published/${saved.id}`,
      );
    } catch (error) {
      console.error(
        "Publish failed:",
        error,
      );
    }
  };

useEffect(() => {
  if (!savedChart) {
    return;
  }


  let parsedSettings = {};

  try {
    parsedSettings =
      typeof savedChart.settings ===
      "string"
        ? JSON.parse(
            savedChart.settings,
          )
        : savedChart.settings || {};
  } catch (error) {
    console.error(
      "Failed to parse chart settings:",
      error,
    );

    parsedSettings = {};
  }

  let savedConfig = {};

  try {
    savedConfig =
      typeof savedChart.chart_config ===
      "string"
        ? JSON.parse(
            savedChart.chart_config,
          )
        : savedChart.chart_config || {};
  } catch (error) {
    console.error(
      "Failed to parse chart config:",
      error,
    );

    savedConfig = {};
  }

  let parsedYValues = [];

  if (Array.isArray(savedConfig.y)) {
    parsedYValues = savedConfig.y;
  } else if (savedConfig.y) {
    parsedYValues = [savedConfig.y];
  } else {
    try {
      const parsedY =
        typeof savedChart.y_axis ===
        "string"
          ? JSON.parse(
              savedChart.y_axis,
            )
          : savedChart.y_axis;

      parsedYValues = Array.isArray(
        parsedY,
      )
        ? parsedY
        : parsedY
          ? [parsedY]
          : [];
    } catch {
      parsedYValues =
        savedChart.y_axis
          ? [savedChart.y_axis]
          : [];
    }
  }

  const inferredDateSource =
    savedConfig.dateHierarchySource ||
    (savedConfig.x?.endsWith(
      "_Month",
    )
      ? savedConfig.x.replace(
          "_Month",
          "",
        )
      : null);

  const inferredHierarchy =
    inferredDateSource
      ? [
          `${inferredDateSource}_Year`,
          `${inferredDateSource}_Quarter`,
          `${inferredDateSource}_Month`,
        ]
      : [];

  const loadedChartConfig = {
    ...defaultChartConfig,
    ...savedConfig,

    x:
      savedConfig.x ??
      savedChart.x_axis ??
      null,

    y: parsedYValues,

    type:
      savedConfig.type ??
      savedChart.chart_type ??
      "bar",

    aggregation:
      savedConfig.aggregation ??
      "none",

    sorting: {
      ...defaultChartConfig.sorting,
      ...(savedConfig.sorting ||
        {}),
    },

    ranking: {
      ...defaultChartConfig.ranking,
      ...(savedConfig.ranking ||
        {}),
    },

    dateGrouping: {
      ...defaultChartConfig.dateGrouping,
      ...(savedConfig.dateGrouping ||
        {}),
    },

    filters: Array.isArray(
      savedConfig.filters,
    )
      ? savedConfig.filters
      : [],

    appearance: {
      ...defaultChartConfig.appearance,
      ...(savedConfig.appearance ||
        {}),

      xAxis: {
        ...defaultChartConfig
          .appearance.xAxis,

        ...(savedConfig.appearance
          ?.xAxis || {}),
      },

      yAxis: {
        ...defaultChartConfig
          .appearance.yAxis,

        ...(savedConfig.appearance
          ?.yAxis || {}),
      },
    },

    xHierarchy:
      savedConfig.xHierarchy
        ?.length
        ? savedConfig.xHierarchy
        : inferredHierarchy,

    dateHierarchySource:
      savedConfig.dateHierarchySource ??
      inferredDateSource,

    timeGroupBy:
      savedConfig.timeGroupBy ??
      (inferredDateSource
        ? "hierarchy"
        : "none"),

    groupSmallCategories:
      savedConfig
        .groupSmallCategories ??
      false,
  };

  const loadedSettings = {
    ...defaultChartSettings,
    ...parsedSettings,
  };

  resetVisualizationHistory({
    settings: loadedSettings,
    chartConfig:
      loadedChartConfig,
    selectedChartValues: [],
    chartHeight:
      getInitialChartHeight(),
  });
}, [
  savedChart,
  id,
  resetVisualizationHistory,
]);


useEffect(() => {
  const handleHistoryShortcut = (
    event,
  ) => {
    const target = event.target;

    const isTyping =
      target instanceof
        HTMLInputElement ||
      target instanceof
        HTMLTextAreaElement ||
      target instanceof
        HTMLSelectElement ||
      target?.isContentEditable;

    if (isTyping) {
      return;
    }

    const hasModifier =
      event.ctrlKey ||
      event.metaKey;

    if (!hasModifier) {
      return;
    }

    const key =
      event.key.toLowerCase();

    if (
      key === "z" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      undo();
      return;
    }

    if (
      (key === "z" &&
        event.shiftKey) ||
      key === "y"
    ) {
      event.preventDefault();
      redo();
    }
  };

  window.addEventListener(
    "keydown",
    handleHistoryShortcut,
  );

  return () => {
    window.removeEventListener(
      "keydown",
      handleHistoryShortcut,
    );
  };
}, [undo, redo]);

useEffect(() => {
  localStorage.setItem(`activeTab-${id}`, activeTab);
}, [activeTab, id]);

useEffect(() => {
  localStorage.setItem(
    `chart-height-${id}`,
    String(chartHeight),
  );
}, [chartHeight, id]);



  return (
    <>
    <Header/>
  <div className="app-page w-full h-screen flex flex-col">
    {/* Editor toolbar */}
    <div className="app-surface app-border h-12 shrink-0 flex items-center border-b px-4 gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="app-text-muted text-sm hover:text-[rgb(var(--color-text))]"
      >
        ← Back to projects
      </button>

      <div className="h-6 w-px bg-[rgb(var(--color-border))]" />

      <div className="flex h-full items-center">
        <button
          onClick={() => setActiveTab("data")}
          className={`h-full px-4 text-sm font-semibold border-b-2 ${
            activeTab === "data"
              ? "border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
              : "border-transparent app-text-secondary"
          }`}
        >
          Data
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`h-full px-4 text-sm font-semibold border-b-2 ${
            activeTab === "preview"
              ? "border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
              : "border-transparent app-text-secondary"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="ml-auto flex gap-2">
        {activeTab === "data" ? (
          <button
            onClick={saveDataset}
            className="btn-primary px-4 py-2 text-sm rounded-lg"
          >
            Save Data
          </button>
        ) : (
          <>
           <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="
                btn-secondary
                rounded-lg
                px-3
                py-2
                text-sm
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              ↶ Undo
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="
                btn-secondary
                rounded-lg
                px-3
                py-2
                text-sm
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              ↷ Redo
            </button>
            <button
              onClick={publishChart}
              className="btn-secondary px-4 py-2 text-sm rounded-lg"
            >
              Publish
            </button>

            <button
              onClick={exportPNG}
              className="btn-secondary px-4 py-2 text-sm rounded-lg"
            >
              Export
            </button>

            <button
              onClick={saveChart}
              className="btn-primary px-4 py-2 text-sm rounded-lg"
            >
              Save
            </button>
           
          </>
        )}
      </div>
    </div>
    {error && (
      <div className="mx-4 mt-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={clearError}
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Close
        </button>
      </div>
    )}

      <div className="app-text flex-1 flex ">

      {activeTab === "data" ? (
        <DataTable
          data={data}
          setData={setData}
          columns={columns}
          setColumns={setColumns}
          datasetId={datasetId}
          handleDataFile={handleDataFile}
          isUploadingFile={isUploadingFile}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">

    <div className="app-surface app-border w-64 border-r">
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
      <div className="max-h-[55%] overflow-y-auto">
        <ChartFiltersPanel
          chartConfig={chartConfig}
          setChartConfig={setChartConfig}
          columns={columns}
          types={columnTypes}
        />
      </div>
    </div>

    <div className="app-page flex-1 p-4">

      <div className="mb-4 space-y-2 w-full">
        
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropAxis("x")}
          className="app-surface-secondary app-border app-text-secondary p-3 border-2 border-dashed rounded-lg flex justify-between items-center"
        >
          <span>X Axis: {chartConfig.x || "Drop field here"}</span>
          
          {chartConfig.x && (
            <button 
              onClick={() => removeFieldFromAxis("x")}
              className="text-[rgb(var(--color-danger))] hover:opacity-80 font-bold px-2"
            >
              ✕
            </button>
          )}
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropAxis("y")}
          className="app-surface-secondary app-border app-text-secondary p-3 border-2 border-dashed rounded-lg"
        >
          <div className="mb-2">
            Y Axis: {chartConfig.y.length ? "" : "Drop fields here"}
          </div>

          <div className="flex flex-wrap gap-2">
            {chartConfig.y.map((field) => (
              <span
                key={field}
                className="app-surface app-border app-text-secondary px-2 py-1 border rounded flex items-center gap-2"
              >
                {field}
                <button
                  onClick={() => removeFieldFromAxis("y", field)}
                  className="text-[rgb(var(--color-danger))] font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      <div className="app-card min-h-0 flex-1 border rounded-lg p-4">
        {selectedChartValues.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <span className="text-sm font-semibold text-blue-800">
              Selected:
            </span>

            {selectedChartValues.map((value) => (
              <span
                key={String(value)}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white"
              >
                {String(value)}
              </span>
            ))}

            <button
              type="button"
              onClick={applyChartSelection}
              className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Keep selected
            </button>

            <button
              type="button"
              onClick={clearChartSelection}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
                
        <ActiveFilterChips
          filters={chartConfig.filters || []}
          onRemoveFilterValue={removeFilterValue}
          onClearFilters={clearFilters}
        />

        <div className="w-full">
          <div
            ref={visibleChartRef}
            className="w-full overflow-hidden"
            style={{
              height: `${chartHeight}px`,
            }}
          >
            <ChartPreview
              chartData={chartData}
              rawData={data}
              chartConfig={chartConfig}
              setChartConfig={setChartConfig}
              columns={columns}
              generatedColors={generatedColors}
              visibleYKeys={visibleYKeys}
              settings={{
                ...settings,
                exportMode: false,
              }}
              onChartItemClick={
                handleChartItemClick
              }
              selectedChartValues={
                selectedChartValues
              }
            />
          </div>

          <div
            role="separator"
            aria-label="Resize chart height"
            onMouseDown={startChartResize}
            className="
              group
              flex
              h-5
              w-full
              cursor-row-resize
              items-center
              justify-center
            "
          >
            <div
              className="
                h-1
                w-16
                rounded-full
                bg-slate-300
                transition-all
                group-hover:w-24
                group-hover:bg-blue-500
              "
            />
          </div>
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
    ref={exportChartRef}
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
      visibleYKeys={visibleYKeys}
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
    <SheetSelectionDialog
      isOpen={excelImport.isOpen}
      fileName={excelImport.fileName}
      sheetNames={excelImport.sheetNames}
      selectedSheet={excelImport.selectedSheet}
      onSheetChange={selectExcelSheet}
      onConfirm={confirmExcelSheet}
      onCancel={cancelExcelImport}
      isLoading={isUploadingFile}
    />
  </>
  );
}

export default NewVisualization;