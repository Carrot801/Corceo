import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
function useProjectData(id) {
    const MIN_ROWS = 30;
    const [columns, setColumns] = useState([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    ]);

    const [data, setData] = useState(() => {
    const cols = columns;

    const emptyRows = Array.from({ length: MIN_ROWS }, () => {
        const row = {};
        cols.forEach(c => (row[c] = ""));
        return row;
    });

    return emptyRows;
    });
    const applyCSV = (rows) => {
        if (!rows?.length) return;

        const cols = Object.keys(rows[0]);

        const normalized = rows.map(row => {
            const clean = {};
            cols.forEach(c => {
            clean[c] = row?.[c] ?? "";
            });
            return clean;
        });

        setColumns(cols);
        setData(normalized);
    };
    const resetSheet = (rows, cols) => {
    const normalized = rows.map(row => {
        const clean = {};
        cols.forEach(c => {
        clean[c] = row?.[c] ?? "";
        });
        return clean;
    });

    setColumns(cols);
    setData(normalized);
    };

    const [datasetId, setDatasetId] = useState(null);

    const [savedChart, setSavedChart] = useState(null);

    const loadChart = async () => {
    try {
        const res = await fetch(
        `http://localhost:5000/charts?project_id=${id}`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const chart = await res.json();

        if (!chart || Object.keys(chart).length === 0) {
        setSavedChart(null);
        return;
        }

        setSavedChart(chart);
    } catch (err) {
        console.error(err);
    }
    };


  const loadProject = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/data/datasets?project_id=${id}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const dataset = await res.json();

      if (!dataset?.id) {
        return;
      }

      setDatasetId(dataset.id);

      const rowsRes = await fetch(
        `http://localhost:5000/data/rows?dataset_id=${dataset.id}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const rows = await rowsRes.json();

      setData(rows);

      if (rows.length > 0) {
        setColumns(Object.keys(rows[0]));
      }

    } catch (err) {
      console.error(err);
    }
  };
const uploadCSV = async (file) => {
  if (!file) return;

  const isCSV =
    file.name.endsWith(".csv") ||
    file.type === "text/csv";

  const isXLSX =
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls");

  try {
    let rows = [];
    if (isCSV) {
      rows = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => resolve(result.data),
          error: (err) => reject(err),
        });
      });
    }
    else if (isXLSX) {
      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });
    }
    else {
      alert("Unsupported file type");
      return;
    }

    if (!rows.length) return;

    const response = await fetch(
      "http://localhost:5000/upload-csv",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          project_id: id,
          rows,
        }),
      }
    );

    const savedDataset = await response.json();
    setDatasetId(savedDataset.datasetId);

    const cols = Object.keys(rows[0]);

    resetSheet(rows, cols);
  } catch (err) {
    console.error("Upload failed:", err);
  }
};


const saveDataset = async () => {
  try {
    const response = await fetch("http://localhost:5000/data/save_dataset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        project_id: id,
        rows: data,
      }),
    });

    const saved = await response.json();

    if (saved.datasetId) {
      setDatasetId(saved.datasetId);
    }

    return saved;
  } catch (err) {
    console.error(err);
  }
};

    const saveChartToBackend = async (chart) => {
        console.log("SENDING:", chart);
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
            const response = await fetch(
            "http://localhost:5000/charts",
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                    project_id: id,
                    dataset_id: datasetId,
                    ...chart,
                    }),
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error Response:", errorText);
                throw new Error("Server responded with an error");
            }
            const savedChart = await response.json();
            setSavedChart(savedChart);

            return savedChart;

        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
    if (!id) return;

    const init = async () => {
        await loadProject();
        await loadChart();
    };

    init();
    }, [id]);

  return {
    data,
    setData,
    setColumns,
    columns,
    datasetId,
    uploadCSV,
    saveDataset,
    savedChart,
    saveChartToBackend,
  };
}

export default useProjectData;