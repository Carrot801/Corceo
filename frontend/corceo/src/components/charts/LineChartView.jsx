import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

const SHAPES = ["circle", "square", "triangle", "diamond", "star"];

function ShapeIcon({ shape, color }) {
  if (shape === "square") {
    return (
      <rect x="2" y="2" width="10" height="10" fill={color} />
    );
  }

  if (shape === "triangle") {
    return (
      <path d="M7 1 L13 13 L1 13 Z" fill={color} />
    );
  }

  if (shape === "diamond") {
    return (
      <path d="M7 1 L13 7 L7 13 L1 7 Z" fill={color} />
    );
  }

  if (shape === "star") {
    return (
      <path
        d="M7 1 L8.8 5 L13 5.2 L9.8 8 L10.8 12.5 L7 10 L3.2 12.5 L4.2 8 L1 5.2 L5.2 5 Z"
        fill={color}
      />
    );
  }

  return <circle cx="7" cy="7" r="5" fill={color} />;
}

function CustomDot({ cx, cy, stroke, shape }) {
  return (
    <svg x={cx - 7} y={cy - 7} width={14} height={14}>
      <ShapeIcon shape={shape} color={stroke} />
    </svg>
  );
}

function CustomLegend({ yKeys, generatedColors }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-3 text-sm">
      {yKeys.map((key, index) => {
        const color = generatedColors[index] || "#3b82f6";
        const shape = SHAPES[index % SHAPES.length];

        return (
          <div key={key} className="flex items-center gap-1">
            <svg width={14} height={14}>
              <ShapeIcon shape={shape} color={color} />
            </svg>
            <span>{key}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChartView({
  chartData = [],
  generatedColors = [],
  settings = {},
  chartConfig = {},
}) {
  const yKeys = Array.isArray(chartConfig.y)
    ? chartConfig.y
    : chartConfig.y
      ? [chartConfig.y]
      : [];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        {settings.showGrid && (
          <CartesianGrid strokeDasharray="3 3" />
        )}

        <XAxis dataKey="x" />
        <YAxis />

        {settings.showLegend !== false && (
          <Legend
            content={() => (
              <CustomLegend
                yKeys={yKeys}
                generatedColors={generatedColors}
              />
            )}
          />
        )}

        <Tooltip
          content={({ active, label }) => {
            if (!active) return null;

            const row = chartData.find(
              (item) => item.x === label
            );

            if (!row) return null;

            return (
              <div className="bg-white p-3 border shadow-md rounded text-sm">
                <p className="font-bold">{label}</p>

                {yKeys.map((key, index) => {
                  const value = Number(row[key]);
                  const total = getTotal(chartData, key);
                  const color = generatedColors[index] || "#3b82f6";
                  const shape = SHAPES[index % SHAPES.length];

                  if (!Number.isFinite(value)) return null;

                  return (
                    <div key={key} className="mb-2">
                      <div className="flex items-center gap-1">
                        <svg width={14} height={14}>
                          <ShapeIcon shape={shape} color={color} />
                        </svg>

                        <span>
                          {key}: {value}
                        </span>
                      </div>

                      <p className="ml-5">
                        Percent: {getPercent(value, total).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />

        {yKeys.map((key, index) => {
          const color = generatedColors[index] || "#3b82f6";
          const shape = SHAPES[index % SHAPES.length];

          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={color}
              strokeWidth={3}
              dot={
                settings.showDots === false
                  ? false
                  : (props) => (
                      <CustomDot
                        {...props}
                        shape={shape}
                      />
                    )
              }
              activeDot={(props) => (
                <CustomDot
                  {...props}
                  shape={shape}
                />
              )}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartView;