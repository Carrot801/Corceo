import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart({ chartData }) {
  const transformedData = {
    ...chartData,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      data: ds.data.map((v, i) => (ds.hiddenSlices?.[i] ? 0 : v))
    }))
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  return <Doughnut data={transformedData} options={options} />;
}

export default DoughnutChart;