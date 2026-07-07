import { useEffect, useState } from "react";

function useProjectData(projectId) {

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [datasetId, setDatasetId] = useState(null);
  const [savedChart, setSavedChart] = useState(null);

  // LOAD PROJECT
  useEffect(() => {

    const loadProject = async () => {
      if (!projectId) return;

      try {

        // =========================
        // LOAD DATASET
        // =========================
        const datasetRes = await fetch(
          `http://localhost:5000/data/datasets?project_id=${projectId}`
        );

        if (!datasetRes.ok) return;

        const dataset = await datasetRes.json();

        if (!dataset) return;

        setDatasetId(dataset.id);

        // =========================
        // LOAD ROWS
        // =========================
        const rowsRes = await fetch(
          `http://localhost:5000/data/rows?dataset_id=${dataset.id}`
        );

        
        if (rowsRes.ok) {
          const rows = await rowsRes.json();

          setData(rows);

          if (rows.length > 0) {
            setColumns(Object.keys(rows[0]));
          }
        }

        // =========================
        // LOAD SAVED CHART
        // =========================
        const chartRes = await fetch(
          `http://localhost:5000/charts?project_id=${projectId}`
        );

        if (chartRes.ok) {
            const chart = await chartRes.json();

            if (chart && Object.keys(chart).length > 0) {
                setSavedChart(chart);
            }
        }

      } catch (err) {
        console.error("Load project error:", err);
      }
    };

    
    loadProject();

  }, [projectId]);

  // =========================
  // SAVE CHART
  // =========================
  const saveChartToBackend = async (chart) => {

    try {

      const response = await fetch(
        "http://localhost:5000/charts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            project_id: projectId,
            ...chart,
          }),
        }
      );

      return await response.json();

    } catch (err) {
      console.error("Save chart error:", err);
    }
    console.log("RAW SAVED CHART:", chart);
  };

  // =========================
  // UPLOAD CSV
  // =========================
  const uploadCSV = async (rows) => {

    try {

      const response = await fetch(
        "http://localhost:5000/upload-csv",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            project_id: projectId,
            rows,
          }),
        }
      );

      const savedDataset = await response.json();

      setDatasetId(savedDataset.id);
      setData(rows);

      if (rows.length > 0) {
        setColumns(Object.keys(rows[0]));
      }

    } catch (err) {
      console.error("Upload CSV error:", err);
    }
  };

  return {
    data,
    setData,
    columns,
    datasetId,
    savedChart,
    uploadCSV,
    saveChartToBackend,
  };
}

export default useProjectData;