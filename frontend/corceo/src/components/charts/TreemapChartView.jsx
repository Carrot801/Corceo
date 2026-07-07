import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatValue } from "../../utils/formatters";
import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

function TreemapChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
const yKey = getYKey(chartConfig);
  const total = getTotal(chartData, yKey);

  const data = [
    {
      name: "root",
      children: chartData.map((item, index) => ({
        name: item.x,
        size: Number(item[yKey]) || 0,
        percentage: getPercent(item[yKey], total),
        color: generatedColors[index] || item.color || "#3b82f6",

      })),
    },
  ];

  const CustomContent = (props) => {
    const { x, y, width, height, name, color, depth } = props;

    // hide root node only
    if (depth === 0) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
        />

        {settings.showLabels !== false && width > 50 && height > 28 && (
          <text
            x={x + 8}
            y={y + 20}
            fill="#fff"
            fontSize={settings.labelSize || 12}
            fontWeight={600}
          >
            {name}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-[400px] min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          content={CustomContent}
          aspectRatio={1}
          isAnimationActive={false}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const row = payload[0].payload;

              if (row.name === "root") return null;

              return (
                <div className="bg-white p-3 border shadow-md rounded text-sm">
                  <p className="font-bold">{row.name}</p>
                  <p>
                    Value: {formatValue(row.size, settings, total)}
                  </p>
                  {settings.tooltipFields?.includes("percentage") && (
                    <p>Percent: {getPercent(row.size, total).toFixed(1)}%</p>
                  )}
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

export default TreemapChartView;