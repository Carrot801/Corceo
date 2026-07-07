import { useState } from "react";
import PalettePicker from "./PalettePicker";
import ChartTypeSelector from "./ChartTypeSelector";
import {
  BarChart3,
  LineChart,
  PieChart,
  Circle,
  AreaChart as AreaChartIcon, 
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

function Sidebar({
  settings,
  updateSetting,
  chartConfig,
  setChartConfig,
}) {
  const [openSection, setOpenSection] = useState("colors");
  const moveField = (index, direction) => {
  const fields = [...settings.tooltipFields];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= fields.length) return;
  
  // Swap items
  [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
  updateSetting("tooltipFields", fields);
};
const customLegendFields = settings.legendFields || [];
const yKeys = Array.isArray(chartConfig.y)
  ? chartConfig.y
  : chartConfig.y
    ? [chartConfig.y]
    : [];

const legendShapes = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "star",
];
const handleDropLegend = (e) => {
  e.preventDefault();

  const col = e.dataTransfer.getData("col");
  if (!col) return;

  const current = settings.legendFields || [];

  if (current.includes(col)) return;

  updateSetting("legendFields", [col]);
};

const removeMainLegendField = (field) => {
  updateSetting(
    "legendFields",
    (settings.legendFields || []).filter((f) => f !== field)
  );
};
const moveLegendField = (index, direction) => {
  const next = [...yKeys];
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= next.length) return;

  [next[index], next[targetIndex]] = [
    next[targetIndex],
    next[index],
  ];

  setChartConfig((prev) => ({
    ...prev,
    y: next,
  }));
};

const removeLegendField = (field) => {
  setChartConfig((prev) => ({
    ...prev,
    y: prev.y.filter((item) => item !== field),
  }));
};
const toggleField = (field) => {
  const current = settings.tooltipFields || [];
  const updated = current.includes(field) 
    ? current.filter(f => f !== field) 
    : [...current, field];
  updateSetting("tooltipFields", updated);
};

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const chartTypes = [
  { id: "bar", label: "Bar", Icon: BarChart3 },
  { id: "line", label: "Line", Icon: LineChart },
  { id: "pie", label: "Pie", Icon: PieChart },
  { id: "donut", label: "Donut", Icon: Circle },
  { id: "area", label: "Area", Icon: AreaChartIcon },

  { id: "scatter", label: "Scatter", Icon: Circle },
  { id: "radar", label: "Radar", Icon: Circle },
  { id: "composed", label: "Composed", Icon: BarChart3 },
  { id: "funnel", label: "Funnel", Icon: Circle },
  { id: "treemap", label: "Treemap", Icon: BarChart3 },
  { id: "waterfall", label: "Waterfall", Icon: BarChart3 },
  { id: "heatmap", label: "Heatmap", Icon: AreaChartIcon },
  ];

  const extendedModes = [
    { id: "gradient", label: "Gradient" },
    { id: "shuffle", label: "Shuffle" },
    { id: "analogous", label: "Analogous" },
  ];

  return (
    <div className="w-72 border-l bg-white overflow-y-auto">


        {/* HEADER SECTION */}
        <div className="border-b">
            

        {/* SECTION BUTTON */}
        <button
            onClick={() => toggleSection("header")}
            className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
        >
            Header
            <span
            className={`transition-transform ${
                openSection === "header" ? "rotate-180" : ""
            }`}
            >
            ^
            </span>
        </button>

        {/* CONTENT */}
        {openSection === "header" && (
            <div className="p-4 space-y-4">

                {/* ALIGNMENT */}
                <div>
                    <label className="text-xs font-bold text-gray-700">
                    Alignment
                    </label>

                    <div className="flex gap-1 mt-1">

                        <button
                            onClick={() => updateSetting("headerAlign", "left")}
                            className={`
                            flex w-10 h-9 items-center justify-center
                            border rounded-md p-2 transition 
                            ${
                                settings.headerAlign === "left"
                                ? "bg-blue-100 border-blue-400 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500"
                            }
                            `}
                        >
                            <AlignLeft size={16} />
                        </button>

                        <button
                            onClick={() => updateSetting("headerAlign", "center")}
                            className={`
                            flex w-10 h-9 items-center justify-center
                            border rounded-md p-2 transition
                            ${
                                settings.headerAlign === "center"
                                ? "bg-blue-100 border-blue-400 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500"
                            }
                            `}
                        >
                            <AlignCenter size={16} />
                        </button>

                        <button
                            onClick={() => updateSetting("headerAlign", "right")}
                            className={`
                            flex w-10 h-9 items-center justify-center
                            border rounded-md p-2 transition
                            ${
                                settings.headerAlign === "right"
                                ? "bg-blue-100 border-blue-400 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500"
                            }
                            `}
                        >
                            <AlignRight size={16} />
                        </button>

                    </div>
                </div>

                {/* TITLE */}
                <div>
                    <label className="text-xs font-bold text-gray-700">
                    Title
                    </label>

                    <input
                    value={settings.title}
                    onChange={(e) =>
                        updateSetting("title", e.target.value)
                    }
                    className="w-full mt-1 border p-2 text-sm"
                    />
                </div>

                {/* SUBTITLE */}
                <div>
                    <label className="text-xs font-bold text-gray-700">
                    Subtitle
                    </label>

                    <input
                    value={settings.subtitle}
                    onChange={(e) =>
                        updateSetting("subtitle", e.target.value)
                    }
                    className="w-full mt-1 border p-2 text-sm"
                    />
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-xs font-bold text-gray-700">
                    Description
                    </label>

                    <textarea
                    value={settings.description}
                    onChange={(e) =>
                        updateSetting("description", e.target.value)
                    }
                    className="w-full mt-1 border p-2 text-sm min-h-[90px]"
                    />
                </div>

            </div>
        )}
        </div>

        {/* COLORS SECTION */}
        <div className="border-b border-t border-gray-400">
            <button
            onClick={() => toggleSection("colors")}
            className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
            >
            Colors
            <span
            className={`transition-transform ${
                openSection === "colors" ? "rotate-180" : ""
            }`}
            >
            ^
            </span>
            </button>

            {openSection === "colors" && (
            <div className="px-4 pb-4 space-y-4 pt-3">
                
                <PalettePicker
                settings={settings}
                updateSetting={updateSetting}
                />

                {/* EXTEND PALETTE CHECKBOX */}
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={settings.extendPalette || false}
                    onChange={(e) => {
                    const isChecked = e.target.checked;
                    updateSetting("extendPalette", isChecked);
                    
                    updateSetting("paletteMode", isChecked ? "gradient" : "repeat");
                    }}
                />
                Extend palette
                </label>
                {/* BUTTONS */}
                {settings.extendPalette && (
                <div className="space-y-1.5 transition-all duration-200">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Extension Method
                    </label>
                    
                    <div className="grid grid-cols-3 gap-1">
                    {extendedModes.map((mode) => {
                        const isActive = settings.paletteMode === mode.id;
                        return (
                        <button
                            key={mode.id}
                            onClick={() => updateSetting("paletteMode", mode.id)}
                            className={`
                            py-1.5 text-xs font-mediumrounded-md transition-all duration-150
                            ${isActive 
                                ? "bg-blue-200 text-blue-500 shadow-sm border border-blue-400 font-bold" 
                                : "text-gray-500 bg-white hover:text-gray-700 border-gray-300 "
                            }
                            `}
                        >
                            {mode.label}
                        </button>
                        );
                    })}
                    </div>
                </div>
                )}

            </div>
            )}
        </div>

        {/* CHART TYPE */}
        <div className="border-b border-gray-400">
            <button
            onClick={() => toggleSection("chart")}
            className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
            >
            Chart Type
            <span
            className={`transition-transform ${
                openSection === "chart" ? "rotate-180" : ""
            }`}
            >
            ^
            </span>
            </button>

            {/* CHART TYPE SECTION */}
            {openSection === "chart" && (
            <div className="px-4 pb-4 space-y-4 pt-3">
                <ChartTypeSelector
                chartTypes={chartTypes}
                chartConfig={chartConfig}
                setChartConfig={setChartConfig}
                />
                <div className="flex items-center gap-2 py-1 border-b pb-3 border-gray-200">
                    <input
                        type="checkbox"
                        id="hideZeros"
                        checked={settings.hideZeros || false}
                        onChange={(e) => updateSetting("hideZeros", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="hideZeros" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                        Hide rows with 0 value
                    </label>
                    </div>

                {/* Aggregation Pills */}
                <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Aggregation
                </label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                    {["none", "sum", "avg", "min", "max", "count"].map((val) => (
                    <button
                        key={val}
                        onClick={() => setChartConfig(prev => ({ ...prev, aggregation: val }))}
                        className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        chartConfig.aggregation === val
                            ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        {val}
                    </button>
                    ))}
                </div>
                </div>
                

                {/* Sort Pills */}
                <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Sort
                </label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                    {["none", "asc", "desc"].map((val) => (
                    <button
                        key={val}
                        onClick={() => setChartConfig(prev => ({ ...prev, sort: val }))}
                        className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        chartConfig.sort === val
                            ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        {val === "none" ? "None" : val === "asc" ? "Asc" : "Desc"}
                    </button>
                    ))}
                </div>
                </div>
            </div>
            )}
        </div>
        {/* TOOLTIP FIELDS SECTION */}
<div className="border-t border-gray-400">
  <button
    onClick={() => toggleSection("tooltip")}
    className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
  >
    Tooltip Content
    <span className={`transition-transform ${openSection === "tooltip" ? "rotate-180" : ""}`}>^</span>
  </button>

  {openSection === "tooltip" && (
    <div className="p-4 space-y-2">
      <p className="text-[10px] text-gray-500 uppercase font-bold">Show in Hover:</p>
      {["name", "value", "percentage"].map((field) => (
        <label key={field} className="flex items-center gap-2 text-xs text-gray-700 capitalize">
          <input
            type="checkbox"
            checked={settings.tooltipFields?.includes(field) ?? true}
            onChange={(e) => {
              const current = settings.tooltipFields || ["name", "value"];
              const next = e.target.checked 
                ? [...current, field] 
                : current.filter(f => f !== field);
              updateSetting("tooltipFields", next);
            }}
          />
          {field}
        </label>
      ))}
    </div>
    
  )}
</div>
{/* LABEL SETTINGS SECTION */}
<div className="border-t border-gray-400">
  <button
    onClick={() => toggleSection("labels")}
    className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
  >
    Label Settings
    <span className={`transition-transform ${openSection === "labels" ? "rotate-180" : ""}`}>^</span>
  </button>

  {openSection === "labels" && (
    <div className="p-4 space-y-4">
      {/* Show Labels Toggle */}
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={settings.showLabels ?? true}
          onChange={(e) => updateSetting("showLabels", e.target.checked)}
        />
        Show Labels
      </label>

      {/* Label Content Selector */}
      <div>
        <label className="text-[11px] font-bold uppercase text-gray-500">Label Content</label>
        <select 
          className="w-full mt-1 border rounded p-2 text-sm"
          value={settings.labelType || "percentage"}
          onChange={(e) => updateSetting("labelType", e.target.value)}
        >
          <option value="name">Category Name</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      {/* Label Position Selector */}
      <div>
        <label className="text-[11px] font-bold uppercase text-gray-500">Position</label>
        <div className="flex gap-2 mt-1">
          {["inside", "outside"].map((pos) => (
            <button
              key={pos}
              onClick={() => updateSetting("labelPosition", pos)}
              className={`flex-1 py-1.5 text-xs font-bold rounded ${
                settings.labelPosition === pos 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700"
              }`}
            >
              {pos.charAt(0).toUpperCase() + pos.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Font Size Slider */}
<div className="mt-4">
  <label className="text-[11px] font-bold uppercase text-gray-500">Label Size</label>
  <input
    type="range"
    min="8"
    max="20"
    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    value={settings.labelSize || 12}
    onChange={(e) => updateSetting("labelSize", parseInt(e.target.value))}
  />
  <span className="text-xs text-gray-600">{settings.labelSize || 12}px</span>
</div>
    </div>
  )}
</div>
        {/* LEGEND SECTION */}
        <div className="border-t border-gray-400">
        <button
            onClick={() => toggleSection("legend")}
            className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
        >
            Legend
            <span
            className={`transition-transform ${
                openSection === "legend" ? "rotate-180" : ""
            }`}
            >
            ^
            </span>
        </button>

        {openSection === "legend" && (
            <div className="px-4 pb-4 pt-3 space-y-4">

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
  <input
    type="checkbox"
    checked={settings.showLegend}
    onChange={(e) =>
      updateSetting("showLegend", e.target.checked)
    }
  />
  Show Legend
</label>

{settings.showLegend && (
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleDropLegend}
    className="min-h-[60px] border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50"
  >
    {(settings.legendFields || []).length === 0 ? (
      <p className="text-xs text-gray-400">
        Drag fields here for legend
      </p>
    ) : (
      <div className="space-y-2">
        {settings.legendFields.map((field) => (
          <div
            key={field}
            className="flex items-center justify-between bg-white border rounded px-2 py-1 text-xs"
          >
            <span>{field}</span>

            <button
              onClick={() => removeMainLegendField(field)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}        
            {/* ALIGN */}
            

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                    Alignment
                    </label>

                    <div className="flex gap-1 mt-1">

                        <button
                            onClick={() => updateSetting("legendAlign", "start")}
                            className={`
                            flex w-10 h-9 items-center justify-center
                            border rounded-md p-2 transition 
                            ${
                                settings.legendAlign === "start"
                                ? "bg-blue-100 border-blue-400 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500"
                            }
                            `}
                        >
                            <AlignLeft size={16} />
                        </button>

                        <button
                            onClick={() => updateSetting("legendAlign", "center")}
                            className={`
                            flex w-10 h-9 items-center justify-center
                            border rounded-md p-2 transition
                            ${
                                settings.legendAlign === "center"
                                ? "bg-blue-100 border-blue-400 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500"
                            }
                            `}
                        >
                            <AlignCenter size={16} />
                        </button>

                        <button
                            onClick={() => updateSetting("legendAlign", "end")}
                            className={`
                            flex w-10 h-9 items-center justify-center
                            border rounded-md p-2 transition
                            ${
                                settings.legendAlign === "end"
                                ? "bg-blue-100 border-blue-400 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500"
                            }
                            `}
                        >
                            <AlignRight size={16} />
                        </button>

                    </div>
            </div>
            <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Legend Fields
            </label>

            {yKeys.length > 1 && (
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Y Axis Legend
                </label>

            {yKeys.map((field, index) => {
                const shape = legendShapes[index % legendShapes.length];

                return (
                <div
                    key={field}
                    className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 bg-white text-xs"
                >
                    <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-400 cursor-grab">☰</span>

                    <span className="w-4 text-center">
                        {shape === "circle" && "●"}
                        {shape === "square" && "■"}
                        {shape === "triangle" && "▲"}
                        {shape === "diamond" && "◆"}
                        {shape === "star" && "★"}
                    </span>

                    <span className="truncate font-medium text-gray-700">
                        {field}
                    </span>
                    </div>

                    <div className="flex items-center gap-1">
                    <button
                        onClick={() => moveLegendField(index, -1)}
                        className="px-1 text-gray-400 hover:text-gray-700"
                    >
                        ↑
                    </button>

                    <button
                        onClick={() => moveLegendField(index, 1)}
                        className="px-1 text-gray-400 hover:text-gray-700"
                    >
                        ↓
                    </button>

                    <button
                        onClick={() => removeLegendField(field)}
                        className="px-1 text-red-400 hover:text-red-600"
                    >
                        ×
                    </button>
                    </div>
                </div>
                );  
            })}
            </div>
            )}
            </div>
            {/* LEGEND TITLE */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Legend Title
                </label>

                <input
                value={settings.legendTitle}
                onChange={(e) =>
                    updateSetting("legendTitle", e.target.value)
                }
                className="w-full mt-1 border p-2 text-sm rounded-md"
                placeholder="Legend"
                />
            </div>

            {/* POSITION */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Position
                </label>

                <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                {["top", "right", "bottom", "left"].map((val) => (
                    <button
                    key={val}
                    onClick={() =>
                        updateSetting("legendPosition", val)
                    }
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        settings.legendPosition === val
                        ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    >
                    {val}
                    </button>
                ))}
                </div>
            </div>

            {/* DIRECTION */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Direction
                </label>

                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                {["row", "column"].map((val) => (
                    <button
                    key={val}
                    onClick={() =>
                        updateSetting("legendDirection", val)
                    }
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        settings.legendDirection === val
                        ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    >
                    {val}
                    </button>
                ))}
                </div>
            </div>

           

            {/* SIZE */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Size
                </label>

                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                {["small", "medium", "large"].map((val) => (
                    <button
                    key={val}
                    onClick={() =>
                        updateSetting("legendSize", val)
                    }
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        settings.legendSize === val
                        ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    >
                    {val}
                    </button>
                ))}
                </div>
            </div>

            {/* GAP */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Gap ({settings.legendGap}px)
                </label>

                <input
                type="range"
                min="0"
                max="40"
                value={settings.legendGap}
                onChange={(e) =>
                    updateSetting("legendGap", Number(e.target.value))
                }
                className="w-full mt-2"
                />
            </div>
            </div>
        )}
        </div>
        
        {/* LAYOUT */}
        <div className="border-t border-gray-400">
        <button
            onClick={() => toggleSection("valueFormatting")}
            className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-800 bg-gray-100"
        >
            Value Formatting

            <span
            className={`transition-transform ${
                openSection === "valueFormatting"
                ? "rotate-180"
                : ""
            }`}
            >
            ^
            </span>
        </button>

        {openSection === "valueFormatting" && (
           <div className="p-4 space-y-4">
  {/* Format Selector */}
  <div>
    <label className="block text-xs font-medium mb-1">Number Format</label>
    <select
      value={settings.numberFormat}
      onChange={(e) => updateSetting("numberFormat", e.target.value)}
      className="w-full border rounded px-2 py-1"
    >
      <option value="default">Default</option>
      <option value="percentage">Percentage</option>
      <option value="currency">Currency</option>
    </select>
  </div>

  {/* Compact Toggle */}
  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
    <input
      type="checkbox"
      checked={settings.compactNumbers || false}
      onChange={(e) => updateSetting("compactNumbers", e.target.checked)}
    />
    Compact Large Numbers (e.g., 1.2M)
  </label>

  {/* Decimal Places */}
  <div>
    <label className="block text-xs font-medium mb-1">Decimal Places</label>
    <input
      type="number"
      min="0"
      max="6"
      value={settings.decimalPlaces ?? 2}
      onChange={(e) => updateSetting("decimalPlaces", Number(e.target.value))}
      className="w-full border rounded px-2 py-1"
    />
  </div>
</div>
        )}
        </div>
      
        </div>
    );
}

export default Sidebar;