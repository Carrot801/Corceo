import {
  FunnelChart,
  Funnel,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import { formatValue } from "../../utils/formatters";

function FunnelChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
}) {
  const total = chartData.reduce(
    (sum, row) => sum + (Number(row.y) || 0),
    0
  );

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const row = payload[0].payload;

                return (
                  <div className="bg-white p-3 border shadow-md rounded text-sm">
                    <p className="font-bold">{row.x}</p>
                    <p>
                      Value: {formatValue(row.y, settings, total)}
                    </p>

                    {settings.tooltipFields?.includes("percentage") && (
                      <p>
                        Percent:{" "}
                        {row.percentage
                          ? row.percentage.toFixed(1)
                          : 0}
                        %
                      </p>
                    )}
                  </div>
                );
              }

              return null;
            }}
          />

          <Funnel
        data={chartData}
        dataKey="y"
        nameKey="x"
        width={500}
        height={350}
        cx="40%"
        cy="50%"
        neckWidth={80}
        neckHeight={40}
        stroke="#fff"
        isAnimationActive={false}
      >
            {chartData.map((_, index) => (
              <Cell
                key={`funnel-cell-${index}`}
                fill={generatedColors[index] || "#3b82f6"}
              />
            ))}

            {settings.showLabels !== false && (
              <LabelList
                dataKey="x"
                position="right"
                fill="#334155"
                fontSize={settings.labelSize || 12}
              />
            )}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FunnelChartView;