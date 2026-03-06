import { useState } from "react";
import BarChart from "./components/BarChart";
import Legend from "./custom/Legend";
import { chartData as initialData } from "./data/chartData";

function App() {

  const [chartData,setChartData] = useState(initialData);

  return (
    <div style={{display:"flex", gap:"40px"}}>

      <div style={{width:"800px", height:"500px"}}>
        <BarChart chartData={chartData}/>
      </div>

      <Legend
        chartData={chartData}
        setChartData={setChartData}
      />

    </div>
  );
}

export default App;