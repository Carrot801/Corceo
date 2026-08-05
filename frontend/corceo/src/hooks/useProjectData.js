import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { parseDataFile, parseExcelSheet } from "../hooks/fileParser";

const API_URL = "http://localhost:5000";

const DEFAULT_COLUMNS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

const MIN_ROWS = 30;

function createEmptyRows(
  columns = DEFAULT_COLUMNS,
  count = MIN_ROWS
) {
  return Array.from(
    { length: count },
    () => {
      const row = {};

      columns.forEach((column) => {
        row[column] = "";
      });

      return row;
    }
  );
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
  const [columns, setColumns] = useState(
    DEFAULT_COLUMNS
  );

  const [data, setData] = useState(() =>
    createEmptyRows()
  );

  const [datasetId, setDatasetId] =
    useState(null);

  const [savedChart, setSavedChart] =
    useState(null);

  const [isLoadingProject, setIsLoadingProject] =
    useState(false);

  const [isUploadingFile, setIsUploadingFile] =
    useState(false);

  const [isSavingDataset, setIsSavingDataset] =
    useState(false);

  const [error, setError] = useState("");

  const [excelImport, setExcelImport] =
    useState({
      isOpen: false,
      fileName: "",
      workbook: null,
      sheetNames: [],
      selectedSheet: "",
    });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }, []);
  

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const resetEmptySheet = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
    setData(createEmptyRows(DEFAULT_COLUMNS));
    setDatasetId(null);
  }, []);

  const applyRows = useCallback(
    (
      rows,
      suppliedColumns = null,
      padToMinimum = false
    ) => {
      const safeRows = Array.isArray(rows)
        ? rows
        : [];

      const detectedColumns =
        Array.isArray(suppliedColumns) &&
        suppliedColumns.length > 0
          ? suppliedColumns
          : safeRows.length > 0
            ? Object.keys(safeRows[0])
            : DEFAULT_COLUMNS;

      const normalizedRows = safeRows.map(
        (row) => {
          const normalizedRow = {};

          detectedColumns.forEach(
            (column) => {
              normalizedRow[column] =
                row?.[column] ?? "";
            }
          );

          return normalizedRow;
        }
      );

      if (
        padToMinimum &&
        normalizedRows.length < MIN_ROWS
      ) {
        const missingRows =
          MIN_ROWS - normalizedRows.length;

        normalizedRows.push(
          ...createEmptyRows(
            detectedColumns,
            missingRows
          )
        );
      }

      setColumns(detectedColumns);
      setData(normalizedRows);
    },
    []
  );

  const readJsonResponse = async (
    response,
    fallbackMessage
  ) => {
    const responseData =
      await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        responseData?.message ??
          responseData?.error ??
          fallbackMessage
      );
    }

    return responseData;
  };

  const loadProject = useCallback(
    async (signal) => {
      const datasetResponse = await fetch(
        `${API_URL}/data/datasets?project_id=${id}`,
        {
          headers: getAuthHeaders(),
          signal,
        }
      );

      if (datasetResponse.status === 404) {
        resetEmptySheet();
        return;
      }

      const dataset = await readJsonResponse(
        datasetResponse,
        "Could not load the project dataset."
      );

      if (!dataset?.id) {
        resetEmptySheet();
        return;
      }

      setDatasetId(dataset.id);

      const rowsResponse = await fetch(
        `${API_URL}/data/rows?dataset_id=${dataset.id}`,
        {
          headers: getAuthHeaders(),
          signal,
        }
      );

      const rows = await readJsonResponse(
        rowsResponse,
        "Could not load dataset rows."
      );

      if (
        !Array.isArray(rows) ||
        rows.length === 0
      ) {
        setColumns(DEFAULT_COLUMNS);
        setData(createEmptyRows(DEFAULT_COLUMNS));
        return;
      }

      applyRows(
        rows,
        Object.keys(rows[0]),
        true
      );
    },
    [
      id,
      getAuthHeaders,
      resetEmptySheet,
      applyRows,
    ]
  );

  // ===================================
  // LOAD CHART
  // ===================================
  const loadChart = useCallback(
    async (signal) => {
      const response = await fetch(
        `${API_URL}/charts?project_id=${id}`,
        {
          headers: getAuthHeaders(),
          signal,
        }
      );

      if (response.status === 404) {
        setSavedChart(null);
        return;
      }

      const chart = await readJsonResponse(
        response,
        "Could not load the saved chart."
      );

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
    [id, getAuthHeaders]
  );

  // ===================================
  // INITIAL LOAD
  // ===================================
  useEffect(() => {
    if (!id) {
      resetEmptySheet();
      setSavedChart(null);
      return;
    }

    const controller =
      new AbortController();

    const initializeProject = async () => {
      setIsLoadingProject(true);
      setError("");

      try {
        await Promise.all([
          loadProject(controller.signal),
          loadChart(controller.signal),
        ]);
      } catch (loadError) {
        if (
          loadError.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Project loading failed:",
          loadError
        );

        setError(
          loadError.message ??
            "Could not load the project."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProject(false);
        }
      }
    };

    initializeProject();

    return () => {
      controller.abort();
    };
  }, [
    id,
    loadProject,
    loadChart,
    resetEmptySheet,
  ]);

  // ===================================
  // UPLOAD PARSED ROWS
  // ===================================
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
    Array.isArray(uploadedColumns) &&
    uploadedColumns.length > 0
      ? uploadedColumns
      : Object.keys(rows[0] ?? {});

  const requestBody = {
    project_id: Number(id),
    rows,

    // Keep these only if your backend accepts them.
    columns: columnsToUpload,
    file_name: metadata.fileName ?? null,
    file_type: metadata.fileType ?? null,
    sheet_name: metadata.sheetName ?? null,
  };

  console.log("UPLOAD DATA REQUEST:", requestBody);

  try {
    const response = await fetch(
      `${API_URL}/upload-data`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },

        body: JSON.stringify(requestBody),
      }
    );

    const responseText = await response.text();

    console.log(
      "UPLOAD DATA STATUS:",
      response.status
    );

    console.log(
      "UPLOAD DATA RESPONSE:",
      responseText
    );

    let savedDataset = null;

    if (responseText) {
      try {
        savedDataset = JSON.parse(responseText);
      } catch {
        throw new Error(
          `The backend returned invalid JSON: ${responseText}`
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        savedDataset?.message ??
          savedDataset?.error ??
          `Upload failed with status ${response.status}.`
      );
    }

    const newDatasetId =
      getReturnedDatasetId(savedDataset);

    if (!newDatasetId) {
      console.error(
        "Unexpected backend response:",
        savedDataset
      );

      throw new Error(
        "Upload succeeded, but the backend did not return a dataset ID."
      );
    }

    setDatasetId(newDatasetId);

    applyRows(
      rows,
      columnsToUpload,
      true
    );

    return {
      ...savedDataset,
      id: newDatasetId,
      datasetId: newDatasetId,
    };
  } catch (uploadError) {
    console.error(
      "Dataset upload failed:",
      uploadError
    );

    setError(
      uploadError.message ??
        "Could not upload the dataset."
    );

    throw uploadError;
  }
};

  // ===================================
  // SELECT CSV OR EXCEL FILE
  // ===================================
  const handleDataFile = async (file) => {
    if (!file) {
      return null;
    }

    setIsUploadingFile(true);
    setError("");

    try {
      const parsedFile =
        await parseDataFile(file);

      if (
        parsedFile.requiresSheetSelection
      ) {
        setExcelImport({
          isOpen: true,
          fileName: parsedFile.fileName,
          workbook: parsedFile.workbook,
          sheetNames:
            parsedFile.sheetNames,
          selectedSheet:
            parsedFile.sheetNames[0] ??
            "",
        });

        return parsedFile;
      }

      const savedDataset =
        await uploadData(
          parsedFile.rows,
          parsedFile.columns,
          {
            fileName:
              parsedFile.fileName,
            fileType:
              parsedFile.fileType,
            sheetName:
              parsedFile.sheetName,
          }
        );

      return {
        ...parsedFile,
        savedDataset,
      };
    } catch (fileError) {
      console.error(
        "File import failed:",
        fileError
      );

      setError(
        fileError.message ??
          "Could not import the file."
      );

      throw fileError;
    } finally {
      setIsUploadingFile(false);
    }
  };

  // ===================================
  // EXCEL SHEET SELECTION
  // ===================================
  const selectExcelSheet = (
    sheetName
  ) => {
    setExcelImport(
      (currentImport) => ({
        ...currentImport,
        selectedSheet: sheetName,
      })
    );
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
    const {
      workbook,
      selectedSheet,
      fileName,
    } = excelImport;

    if (!workbook) {
      const message =
        "The Excel workbook is not loaded.";

      setError(message);
      throw new Error(message);
    }

    if (!selectedSheet) {
      const message =
        "Select an Excel worksheet.";

      setError(message);
      throw new Error(message);
    }

    setIsUploadingFile(true);
    setError("");

    try {
      const parsedSheet =
        parseExcelSheet(
          workbook,
          selectedSheet
        );

      const savedDataset =
        await uploadData(
          parsedSheet.rows,
          parsedSheet.columns,
          {
            fileName,
            fileType: "excel",
            sheetName:
              selectedSheet,
          }
        );

      cancelExcelImport();

      return savedDataset;
    } catch (sheetError) {
      console.error(
        "Worksheet import failed:",
        sheetError
      );

      setError(
        sheetError.message ??
          "Could not import the worksheet."
      );

      throw sheetError;
    } finally {
      setIsUploadingFile(false);
    }
  };

  // ===================================
  // REMOVE COMPLETELY EMPTY ROWS
  // ===================================
  const getRowsForSaving = () => {
    return data.filter((row) =>
      Object.values(row ?? {}).some(
        (value) =>
          String(value ?? "").trim() !==
          ""
      )
    );
  };

  // ===================================
  // SAVE DATASET
  // ===================================
  const saveDataset = async () => {
    if (!id) {
      throw new Error(
        "No project selected."
      );
    }

    const rowsToSave =
      getRowsForSaving();

    if (rowsToSave.length === 0) {
      throw new Error(
        "There is no data to save."
      );
    }

    setIsSavingDataset(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/data/save_dataset`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            ...getAuthHeaders(),
          },

          body: JSON.stringify({
            project_id: id,
            dataset_id: datasetId,
            columns,
            rows: rowsToSave,
          }),
        }
      );

      const savedDataset =
        await readJsonResponse(
          response,
          "Could not save the dataset."
        );

      const savedDatasetId =
        getReturnedDatasetId(
          savedDataset
        );

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
      console.error(
        "Dataset saving failed:",
        saveError
      );

      setError(
        saveError.message ??
          "Could not save the dataset."
      );

      throw saveError;
    } finally {
      setIsSavingDataset(false);
    }
  };

  // ===================================
  // SAVE CHART
  // ===================================
  const saveChartToBackend = async (
    chart
  ) => {
    if (!id) {
      throw new Error(
        "No project selected."
      );
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "No authentication token found."
      );
    }

    const chartDatasetId =
      chart?.dataset_id ??
      datasetId;

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

    console.log(
      "SENDING CHART:",
      requestBody
    );

    try {
      const response = await fetch(
        `${API_URL}/charts`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            requestBody
          ),
        }
      );

      const savedChartResponse =
        await readJsonResponse(
          response,
          "Could not save the chart."
        );

      setSavedChart(
        savedChartResponse
      );

      return savedChartResponse;
    } catch (chartError) {
      console.error(
        "Chart saving failed:",
        chartError
      );

      setError(
        chartError.message ??
          "Could not save the chart."
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