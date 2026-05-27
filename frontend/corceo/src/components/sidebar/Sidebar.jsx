import { useState } from "react";
import PalettePicker from "./PalettePicker";
import ChartTypeSelector from "./ChartTypeSelector";
import {
  BarChart3,
  LineChart,
  PieChart,
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
  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const chartTypes = [
    { id: "bar", label: "Bar", Icon: BarChart3 },
    { id: "line", label: "Line", Icon: LineChart },
    { id: "pie", label: "Pie", Icon: PieChart },
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

            {/* SHOW LEGEND */}
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
        <div className="p-4">
            <label className="flex items-center gap-2 text-xs text-gray-800">
            <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => updateSetting("showGrid", e.target.checked)}
            />
            Show Grid
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-800 mt-2">
            <input
                type="checkbox"
                checked={settings.showLegend}
                onChange={(e) => updateSetting("showLegend", e.target.checked)}
            />
            Show Legend
            </label>
        </div>
        </div>
    );
}

export default Sidebar;