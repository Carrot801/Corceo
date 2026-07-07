import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatValue } from "../../utils/formatters";
import {
  getYKey,
  getTotal,
  getPercent,
} from "../../utils/chartValueHelpers";

function PieChartView({ chartData, settings, generatedColors, chartConfig }) {
  const fields = settings.tooltipFields || ["name", "value"];

  const yKey = getYKey(chartConfig);
  const total = getTotal(chartData, yKey);

  const renderLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, x, y, payload } = props;
    const fontSize = settings.labelSize || 12;

    let labelText = "";

    if (settings.labelType === "name") {
      labelText = payload.x;
    } else if (settings.labelType === "percentage") {
      const percent = total
        ? (Number(payload[yKey]) / total) * 100
        : 0;

      labelText = `${percent.toFixed(0)}%`;
    } else {
      labelText = formatValue(payload[yKey], settings, total);
    }

    if (settings.labelPosition === "inside") {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const posX = cx + radius * Math.cos(-midAngle * RADIAN);
      const posY = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={posX}
          y={posY}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight={600}
        >
          {labelText}
        </text>
      );
    }

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={fontSize}
      >
        {labelText}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey={yKey}
          nameKey="x"
          outerRadius={120}
          label={settings.showLabels !== false ? renderLabel : false}
          labelLine={settings.labelPosition === "outside"}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={generatedColors[index % generatedColors.length]}
            />
          ))}
        </Pie>

        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;

              return (
                <div className="bg-white p-3 border shadow-md rounded">
                  {fields.includes("name") && (
                    <p className="font-bold">{data.x}</p>
                  )}

                  {fields.includes("value") && (
                    <p>Value: {formatValue(data[yKey], settings, total)}</p>
                  )}

                  {fields.includes("percentage") && (
                    <p>
                      Percent:{" "}
                      {total
                        ? ((Number(data[yKey]) / total) * 100).toFixed(1)
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
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieChartView;