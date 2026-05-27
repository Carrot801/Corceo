import { useState } from "react";
import BarChart from "./components/BarChart";
import DoughnutChart from "./components/DoughnutChart";
import Legend from "./custom/Legend";
import { chartData as initialData } from "./data/chartData";
import { doughnutChartData as initialDoughnutData } from "./data/chartData";
import BasePage from "./components/BasePage";
import Projects from "./components/Projects";
import NewVisualization from "./pages/NewVisualization";
import PublishedChart from "./pages/PublishedChart";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

function ChartsPage() {
  const navigate = useNavigate();

  const [chartData, setChartData] = useState(initialData);
  const [doughnutChartData, setDoughnutChartData] = useState(initialDoughnutData);
  return (
    <div>
      <button onClick={() => navigate("/base")}>
        Back
      </button>

      <div style={{display:"flex", gap:"40px"}}>

        <div style={{width:"800px", height:"500px"}}>
          <BarChart chartData={chartData}/>
        </div>

        <Legend
          chartData={chartData}
          setChartData={setChartData}
        />

      </div>

      <div>
        <div style={{width:"800px", height:"500px"}}>
          <DoughnutChart chartData={doughnutChartData}/>
        </div>

        <Legend
          chartData={doughnutChartData}
          setChartData={setDoughnutChartData}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChartsPage />} />
        <Route path="/base" element={<BasePage/>} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/NewVisualization/:id" element={<NewVisualization/>} />
        <Route path="/published/:chartId" element={<PublishedChart/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;