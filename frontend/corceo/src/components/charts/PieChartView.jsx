import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

function PieChartView({
  chartData,
  generatedColors,
}) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>

        <Pie
          data={chartData}
          dataKey="y"
          nameKey="x"
          outerRadius={120}
          label
        >
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={generatedColors[index]}
            />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieChartView;