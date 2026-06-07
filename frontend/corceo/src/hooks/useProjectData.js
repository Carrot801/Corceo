import { useEffect, useState } from "react";
import Papa from "papaparse";

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
        `http://localhost:5000/charts?project_id=${id}`
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
        `http://localhost:5000/data/datasets?project_id=${id}`
      );

      const dataset = await res.json();

      if (!dataset?.id) {
        return;
      }

      setDatasetId(dataset.id);

      const rowsRes = await fetch(
        `http://localhost:5000/data/rows?dataset_id=${dataset.id}`
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
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,

            complete: async (result) => {
            try {
                const response = await fetch(
                "http://localhost:5000/upload-csv",
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                    project_id: id,
                    rows: result.data,
                    }),
                }
                );

                const savedDataset = await response.json();
                setDatasetId(savedDataset.id);

                const csvRows = result.data || [];
                if (!csvRows.length) return;

                const cols = Object.keys(csvRows[0]);

                // 🧠 HARD RESET (THIS FIXES EVERYTHING)
                resetSheet(csvRows, cols);

            } catch (err) {
                console.error(err);
            }
            }
        });
        };
const saveDataset = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/data/save_dataset",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id: id,
          rows: data
        })
      }
    );

    return await response.json();

  } catch(err) {
    console.error(err);
  }
};

    const saveChartToBackend = async (chart) => {
        try {
            const response = await fetch(
            "http://localhost:5000/charts",
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
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