import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function BarChartView({
  chartData,
  generatedColors,
  settings,
}) {

  const hasData =
    chartData && Array.isArray(chartData) && chartData.length > 0;

  return (
    <ResponsiveContainer width="100%" height={600} >
      <BarChart data={chartData}>

        {settings.showGrid && (
          <CartesianGrid strokeDasharray="3 3" />
        )}

        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="y" radius={[6, 6, 0, 0]}>
          {hasData &&
            chartData.map((_, index) => (
              <Cell
                key={index}
                fill={generatedColors?.[index] || "#3b82f6"}
              />
            ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
}

export default BarChartView;