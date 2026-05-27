import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function LineChartView({
  chartData,
  generatedColors,
  settings,
}) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>

        {settings.showGrid && (
          <CartesianGrid strokeDasharray="3 3" />
        )}

        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="y"
          stroke={generatedColors[0]}
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartView;