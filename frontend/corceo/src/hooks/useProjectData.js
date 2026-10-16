import { useCallback, useEffect, useState } from "react";
import { parseDataFile, parseExcelSheet } from "../hooks/fileParser";
import { apiRequest } from "../api/client";

const DEFAULT_COLUMNS = ["A", "B", "C", "D", "E", "F"];
const MIN_ROWS = 30;

function createEmptyRows(
  columns = DEFAULT_COLUMNS,
  count = MIN_ROWS
) {
  return Array.from({ length: count }, () => {
    const row = {};

    columns.forEach((column) => {
      row[column] = "";
    });

    return row;
  });
}

function getReturnedDatasetId(responseData) {
  return (
    responseData?.datasetId ??
    responseData?.dataset_id ??
    responseData?.id ??
    responseData?.dataset?.id ??
    null
  );
}

function useProjectData(id) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [data, setData] = useState(() => createEmptyRows());
  const [datasetId, setDatasetId] = useState(null);
  const [savedChart, setSavedChart] = useState(null);

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSavingDataset, setIsSavingDataset] = useState(false);

  const [error, setError] = useState("");

  const [excelImport, setExcelImport] = useState({
    isOpen: false,
    fileName: "",
    workbook: null,
    sheetNames: [],
    selectedSheet: "",
  });

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const resetEmptySheet = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
    setData(createEmptyRows(DEFAULT_COLUMNS));
    setDatasetId(null);
  }, []);

  const applyRows = useCallback(
    (rows, suppliedColumns = null, padToMinimum = false) => {
      const safeRows = Array.isArray(rows) ? rows : [];

      const detectedColumns =
        Array.isArray(suppliedColumns) && suppliedColumns.length > 0
          ? suppliedColumns
          : safeRows.length > 0
            ? Object.keys(safeRows[0])
            : DEFAULT_COLUMNS;

      const normalizedRows = safeRows.map((row) => {
        const normalizedRow = {};

        detectedColumns.forEach((column) => {
          normalizedRow[column] = row?.[column] ?? "";
        });

        return normalizedRow;
      });

      if (padToMinimum && normalizedRows.length < MIN_ROWS) {
        normalizedRows.push(
          ...createEmptyRows(
            detectedColumns,
            MIN_ROWS - normalizedRows.length
          )
        );
      }

      setColumns(detectedColumns);
      setData(normalizedRows);
    },
    []
  );

  const loadProject = useCallback(
    async (signal) => {
      let dataset;

      try {
        dataset = await apiRequest(
          `/data/datasets?project_id=${id}`,
          { signal }
        );
      } catch (error) {
        if (signal.aborted) return;

        if (
          error.status === 404 &&
          error.message === "Dataset not found"
        ) {
          resetEmptySheet();
          return;
        }

        throw error;
      }

      if (signal.aborted) return;

      if (!dataset?.id) {
        resetEmptySheet();
        return;
      }

      const rows = await apiRequest(
        `/data/rows?dataset_id=${dataset.id}`,
        { signal }
      );

      if (signal.aborted) return;

      if (!Array.isArray(rows)) {
        throw new Error(
          "The server returned an invalid dataset response."
        );
      }

      setDatasetId(dataset.id);

      if (rows.length === 0) {
        setColumns(DEFAULT_COLUMNS);
        setData(createEmptyRows(DEFAULT_COLUMNS));
        return;
      }

      applyRows(rows, Object.keys(rows[0]), true);
    },
    [id, resetEmptySheet, applyRows]
  );

  const loadChart = useCallback(
    async (signal) => {
      let chart;

      try {
        chart = await apiRequest(
          `/charts?project_id=${id}`,
          { signal }
        );
      } catch (error) {
        if (signal.aborted) return;

        if (
          error.status === 404 &&
          error.message === "Chart not found"
        ) {
          setSavedChart(null);
          return;
        }

        throw error;
      }

      if (signal.aborted) return;

      if (
        !chart ||
        typeof chart !== "object" ||
        Object.keys(chart).length === 0
      ) {
        setSavedChart(null);
        return;
      }

      setSavedChart(chart);
    },
    [id]
  );

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const initializeProject = async () => {
      setIsLoadingProject(true);
      setError("");
      resetEmptySheet();
      setSavedChart(null);

      // Finish loading only after both requests have settled.
      const results = await Promise.allSettled([
        loadProject(controller.signal),
        loadChart(controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const failure = results.find(
        (result) =>
          result.status === "rejected" &&
          result.reason?.name !== "AbortError"
      );

      if (failure) {
        console.error("Project loading failed:", failure.reason);

        setError(
          failure.reason?.message ?? "Could not load the project."
        );
      }

      setIsLoadingProject(false);
    };

    initializeProject();

    return () => {
      controller.abort();
    };
  }, [id, loadProject, loadChart, resetEmptySheet]);

  const uploadData = async (
    rows,
    uploadedColumns = null,
    metadata = {}
  ) => {
    if (!id) {
      throw new Error("No project selected.");
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("There are no rows to upload.");
    }

    const columnsToUpload =
      Array.isArray(uploadedColumns) && uploadedColumns.length > 0
        ? uploadedColumns
        : Object.keys(rows[0] ?? {});

    const requestBody = {
      project_id: Number(id),
      rows,
      columns: columnsToUpload,
      file_name: metadata.fileName ?? null,
      file_type: metadata.fileType ?? null,
      sheet_name: metadata.sheetName ?? null,
    };

    try {
      setError("");

      const savedDataset = await apiRequest("/upload-data", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const newDatasetId = getReturnedDatasetId(savedDataset);

      if (!newDatasetId) {
        throw new Error(
          "Upload succeeded, but the backend did not return a dataset ID."
        );
      }

      setDatasetId(newDatasetId);

      // Display the imported data after server confirmation.
      applyRows(rows, columnsToUpload, true);

      return {
        ...savedDataset,
        id: newDatasetId,
        datasetId: newDatasetId,
      };
    } catch (uploadError) {
      console.error("Dataset upload failed:", uploadError);

      setError(
        uploadError.message ?? "Could not upload the dataset."
      );

      throw uploadError;
    }
  };

  const handleDataFile = async (file) => {
    if (!file) return null;

    setIsUploadingFile(true);
    setError("");

    try {
      const parsedFile = await parseDataFile(file);

      if (parsedFile.requiresSheetSelection) {
        setExcelImport({
          isOpen: true,
          fileName: parsedFile.fileName,
          workbook: parsedFile.workbook,
          sheetNames: parsedFile.sheetNames,
          selectedSheet: parsedFile.sheetNames[0] ?? "",
        });

        return parsedFile;
      }

      const savedDataset = await uploadData(
        parsedFile.rows,
        parsedFile.columns,
        {
          fileName: parsedFile.fileName,
          fileType: parsedFile.fileType,
          sheetName: parsedFile.sheetName,
        }
      );

      return {
        ...parsedFile,
        savedDataset,
      };
    } catch (fileError) {
      console.error("File import failed:", fileError);

      setError(
        fileError.message ?? "Could not import the file."
      );

      throw fileError;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const selectExcelSheet = (sheetName) => {
    setExcelImport((currentImport) => ({
      ...currentImport,
      selectedSheet: sheetName,
    }));
  };

  const cancelExcelImport = () => {
    setExcelImport({
      isOpen: false,
      fileName: "",
      workbook: null,
      sheetNames: [],
      selectedSheet: "",
    });
  };

  const confirmExcelSheet = async () => {
    const { workbook, selectedSheet, fileName } = excelImport;

    if (!workbook) {
      const message = "The Excel workbook is not loaded.";
      setError(message);
      throw new Error(message);
    }

    if (!selectedSheet) {
      const message = "Select an Excel worksheet.";
      setError(message);
      throw new Error(message);
    }

    setIsUploadingFile(true);
    setError("");

    try {
      const parsedSheet = parseExcelSheet(
        workbook,
        selectedSheet
      );

      const savedDataset = await uploadData(
        parsedSheet.rows,
        parsedSheet.columns,
        {
          fileName,
          fileType: "excel",
          sheetName: selectedSheet,
        }
      );

      cancelExcelImport();

      return savedDataset;
    } catch (sheetError) {
      console.error("Worksheet import failed:", sheetError);

      setError(
        sheetError.message ?? "Could not import the worksheet."
      );

      throw sheetError;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const getRowsForSaving = () => {
    return data.filter((row) =>
      Object.values(row ?? {}).some(
        (value) => String(value ?? "").trim() !== ""
      )
    );
  };

  const saveDataset = async () => {
    if (!id) {
      throw new Error("No project selected.");
    }

    const rowsToSave = getRowsForSaving();

    if (rowsToSave.length === 0) {
      throw new Error("There is no data to save.");
    }

    setIsSavingDataset(true);
    setError("");

    try {
      const savedDataset = await apiRequest(
        "/data/save_dataset",
        {
          method: "POST",
          body: JSON.stringify({
            project_id: id,
            dataset_id: datasetId,
            columns,
            rows: rowsToSave,
          }),
        }
      );

      const savedDatasetId = getReturnedDatasetId(savedDataset);

      if (!savedDatasetId) {
        throw new Error(
          "The backend did not return a dataset ID."
        );
      }

      setDatasetId(savedDatasetId);

      return {
        ...savedDataset,
        id: savedDatasetId,
        datasetId: savedDatasetId,
      };
    } catch (saveError) {
      console.error("Dataset saving failed:", saveError);

      setError(
        saveError.message ?? "Could not save the dataset."
      );

      throw saveError;
    } finally {
      setIsSavingDataset(false);
    }
  };

  const saveChartToBackend = async (chart) => {
    if (!id) {
      throw new Error("No project selected.");
    }

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found.");
    }

    const chartDatasetId = chart?.dataset_id ?? datasetId;

    if (!chartDatasetId) {
      throw new Error(
        "Save the dataset before saving the chart."
      );
    }

    const requestBody = {
      ...chart,
      project_id: id,
      dataset_id: chartDatasetId,
    };

    try {
      const savedChartResponse = await apiRequest("/charts", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      setSavedChart(savedChartResponse);

      return savedChartResponse;
    } catch (chartError) {
      console.error("Chart saving failed:", chartError);

      setError(
        chartError.message ?? "Could not save the chart."
      );

      throw chartError;
    }
  };

  return {
    data,
    setData,
    columns,
    setColumns,
    datasetId,
    savedChart,

    isLoadingProject,
    isUploadingFile,
    isSavingDataset,

    error,
    clearError,

    handleDataFile,
    uploadData,

    excelImport,
    selectExcelSheet,
    confirmExcelSheet,
    cancelExcelImport,

    saveDataset,
    saveChartToBackend,
  };
}

export default useProjectData;