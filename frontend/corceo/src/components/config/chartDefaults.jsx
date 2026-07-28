export const defaultChartSettings = {
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

  showTooltip: true,
  tooltipFields: ["name", "value"],
  tooltipExtraFields: [],
  tooltipUseChartFormat: true,

  labelType: "percentage",
  labelPosition: "inside",
  showLabels: true,
  hideZeros: false,

  tooltipFields: ["name", "value"],

  formatMode: "decimal",
  compactNumbers: false,
  numberFormat: "default",
  decimalPlaces: 2,
};

export const defaultChartConfig = {
  x: null,
  y: [],
  type: "bar",

  aggregation: "none",

  sorting: {
    field: null,
    direction: "none",
  },

  appearance: {
    barCategoryGap: 24,
    barGap: 4,
    barRadius: 5,
    maxBarSize: 72,

    xAxis: {
      visible: true,
      labelLayout: "auto",
      tickSize: 11,
      maxLabelLength: 18,
      minTickGap: 16,
      showEveryLabel: false,
      showLine: true,
      showTicks: false,
      showGrid: false,
    },

    yAxis: {
      visible: true,
      tickSize: 11,
      showLine: false,
      showTicks: false,
      showGrid: true,
      min: "auto",
      max: "auto",
    },
  },

  ranking: {
    enabled: false,
    direction: "top",
    count: 10,
    field: null,
  },

  dateGrouping: {
    field: null,
    interval: "none",
  },

  filters: [],

  xHierarchy: [],
  dateHierarchySource: null,
  groupSmallCategories: false,
  timeGroupBy: "none",
};