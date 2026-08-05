import { useState } from "react";
import {
  BarChart3,
  ChartColumn,
  LineChart,
  PieChart,
  Circle,
  AreaChart,
  ScatterChart,
  Radar,
  ChartNoAxesColumnIncreasing,
  Funnel,
  LayoutGrid,
  Grid3X3,
} from "lucide-react";

import HeaderSection from "./sections/HeaderSection";
import ColorsSection from "./sections/ColorsSection";
import ChartTypeSection from "./sections/ChartTypeSection";
import AppearanceSection from "./sections/AppearanceSection";
import TooltipSection from "./sections/TooltipSection";
import LegendSection from "./sections/LegendSection";
import ValueFormattingSection from "./sections/ValueFormattingSection";
import ConditionalFormattingSection from "./sections/ConditionalFormattingSection";

function Sidebar({
  settings,
  updateSetting,
  chartConfig,
  setChartConfig,
}) {
  const [openSection, setOpenSection] = useState("colors");

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

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
  };

  const handleDropLegend = (event) => {
    event.preventDefault();

    const field = event.dataTransfer.getData("col");
    if (!field) return;

    const current = settings.legendFields || [];
    if (current.includes(field)) return;

    // Preserves your current behavior: only one main legend field.
    updateSetting("legendFields", [field]);
  };

  const removeMainLegendField = (field) => {
    updateSetting(
      "legendFields",
      (settings.legendFields || []).filter(
        (item) => item !== field
      )
    );
  };

  const moveLegendField = (index, direction) => {
    const next = [...yKeys];
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= next.length
    ) {
      return;
    }

    [next[index], next[targetIndex]] = [
      next[targetIndex],
      next[index],
    ];

    setChartConfig((current) => ({
      ...current,
      y: next,
    }));
  };

  const removeLegendField = (field) => {
    setChartConfig((current) => ({
      ...current,
      y: current.y.filter(
        (item) => item !== field
      ),
    }));
  };

  const handleDropTooltipField = (event) => {
    event.preventDefault();

    const field = event.dataTransfer.getData("col");
    if (!field) return;

    const current =
      settings.tooltipExtraFields || [];

    if (current.includes(field)) return;

    updateSetting("tooltipExtraFields", [
      ...current,
      field,
    ]);
  };

  const removeTooltipField = (fieldToRemove) => {
    updateSetting(
      "tooltipExtraFields",
      (settings.tooltipExtraFields || []).filter(
        (field) => field !== fieldToRemove
      )
    );
  };

  const chartTypes = [
    { id: "bar", label: "Bar", Icon: BarChart3 },
    { id: "line", label: "Line", Icon: LineChart },
    { id: "pie", label: "Pie", Icon: PieChart },
    { id: "donut", label: "Donut", Icon: Circle },
    { id: "area", label: "Area", Icon: AreaChart },
    {
      id: "scatter",
      label: "Scatter",
      Icon: ScatterChart,
    },
    { id: "radar", label: "Radar", Icon: Radar },
    {
      id: "composed",
      label: "Composed",
      Icon: ChartNoAxesColumnIncreasing,
    },
    { id: "funnel", label: "Funnel", Icon: Funnel },
    {
      id: "treemap",
      label: "Treemap",
      Icon: LayoutGrid,
    },
    {
      id: "waterfall",
      label: "Waterfall",
      Icon: ChartColumn,
    },
    {
      id: "heatmap",
      label: "Heatmap",
      Icon: Grid3X3,
    },
  ];

  const sharedSectionProps = {
    openSection,
    toggleSection,
  };

  return (
    <aside className="app-surface app-border app-text w-72 overflow-y-auto border-l">
      <HeaderSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
      />

      <ColorsSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
      />

      <ConditionalFormattingSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
        chartConfig={chartConfig}
      />

      <ChartTypeSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
        chartConfig={chartConfig}
        setChartConfig={setChartConfig}
        chartTypes={chartTypes}
      />

      <AppearanceSection
        {...sharedSectionProps}
        chartConfig={chartConfig}
        setChartConfig={setChartConfig}
      />

      <TooltipSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
        chartConfig={chartConfig}
        handleDropTooltipField={
          handleDropTooltipField
        }
        removeTooltipField={
          removeTooltipField
        }
      />

      <LegendSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
        handleDropLegend={handleDropLegend}
        removeMainLegendField={
          removeMainLegendField
        }
        yKeys={yKeys}
        legendShapes={legendShapes}
        moveLegendField={moveLegendField}
        removeLegendField={removeLegendField}
      />

      <ValueFormattingSection
        {...sharedSectionProps}
        settings={settings}
        updateSetting={updateSetting}
      />
    </aside>
  );
}

export default Sidebar;
