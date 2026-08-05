import { useCallback, useEffect, useState } from "react";

import { parseDataFile, parseExcelSheet } from "../fileParser";




const API_URL = "http://localhost:5000";

function useProjectData(projectId) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [datasetId, setDatasetId] = useState(null);
  const [savedChart, setSavedChart] = useState(null);

  const [isLoadingProject, setIsLoadingProject] =
    useState(false);

  const [isUploadingFile, setIsUploadingFile] =
    useState(false);

  const [error, setError] = useState("");

  const [excelImport, setExcelImport] = useState({
    isOpen: false,
    fileName: "",
    workbook: null,
    sheetNames: [],
    selectedSheet: "",
  });

  const getAuthorizationHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }, []);

  const applyRows = useCallback(
    (rows, suppliedColumns = null) => {
      if (!Array.isArray(rows)) {
        setData([]);
        setColumns([]);
        return;
      }

      setData(rows);

      if (
        Array.isArray(suppliedColumns) &&
        suppliedColumns.length > 0
      ) {
        setColumns(suppliedColumns);
        return;
      }

      if (rows.length > 0) {
        setColumns(Object.keys(rows[0]));
      } else {
        setColumns([]);
      }
    },
    []
  );

  /**
   * Loads the dataset and saved chart from the backend.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadProject = async () => {
      if (!projectId) {
        setData([]);
        setColumns([]);
        setDatasetId(null);
        setSavedChart(null);
        return;
      }

      setIsLoadingProject(true);
      setError("");

      try {
        const headers = getAuthorizationHeaders();

        const datasetResponse = await fetch(
          `${API_URL}/data/datasets?project_id=${projectId}`,
          {
            headers,
            signal: controller.signal,
          }
        );

        /*
         * A project may not have a dataset yet.
         * In that case, we still try to load its chart.
         */
        if (datasetResponse.ok) {
          const dataset = await datasetResponse.json();

          if (dataset?.id) {
            setDatasetId(dataset.id);

            const rowsResponse = await fetch(
              `${API_URL}/data/rows?dataset_id=${dataset.id}`,
              {
                headers,
                signal: controller.signal,
              }
            );

            if (!rowsResponse.ok) {
              throw new Error(
                "Could not load the dataset rows."
              );
            }

            const rows = await rowsResponse.json();

            applyRows(Array.isArray(rows) ? rows : []);
          } else {
            setDatasetId(null);
            applyRows([]);
          }
        } else if (datasetResponse.status === 404) {
          setDatasetId(null);
          applyRows([]);
        } else {
          throw new Error(
            "Could not load the project dataset."
          );
        }

        const chartResponse = await fetch(
          `${API_URL}/charts?project_id=${projectId}`,
          {
            headers,
            signal: controller.signal,
          }
        );

        if (chartResponse.ok) {
          const chart = await chartResponse.json();

          if (
            chart &&
            typeof chart === "object" &&
            Object.keys(chart).length > 0
          ) {
            setSavedChart(chart);
          } else {
            setSavedChart(null);
          }
        } else if (chartResponse.status === 404) {
          setSavedChart(null);
        } else {
          throw new Error(
            "Could not load the saved chart."
          );
        }
      } catch (loadError) {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Load project error:", loadError);

        setError(
          loadError.message ||
            "An error occurred while loading the project."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProject(false);
        }
      }
    };

    loadProject();

    return () => {
      controller.abort();
    };
  }, [
    projectId,
    applyRows,
    getAuthorizationHeaders,
  ]);

  /**
   * Saves the chart configuration.
   */
  const saveChartToBackend = async (chart) => {
    if (!projectId) {
      throw new Error("No project selected.");
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/charts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthorizationHeaders(),
          },
          body: JSON.stringify({
            project_id: projectId,
            ...chart,
          }),
        }
      );

      const responseBody = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          responseBody?.message ||
            responseBody?.error ||
            "Could not save the chart."
        );
      }

      setSavedChart(responseBody);

      return responseBody;
    } catch (saveError) {
      console.error("Save chart error:", saveError);

      setError(
        saveError.message ||
          "An error occurred while saving the chart."
      );

      throw saveError;
    }
  };

  /**
   * Sends parsed rows to the backend.
   *
   * This method works for rows originating from
   * both CSV and Excel files.
   */
  const uploadData = async (
    rows,
    uploadedColumns = null,
    metadata = {}
  ) => {
    if (!projectId) {
      throw new Error("No project selected.");
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("There are no rows to upload.");
    }

    try {
      setError("");

      /*
       * You can keep /upload-csv temporarily,
       * although /data/upload would be a clearer name.
       */
      const response = await fetch(
        `${API_URL}/upload-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthorizationHeaders(),
          },
          body: JSON.stringify({
            project_id: projectId,
            rows,

            /*
             * The backend may ignore these fields for now.
             * They are useful if you later store import metadata.
             */
            columns:
              uploadedColumns ??
              (rows.length > 0
                ? Object.keys(rows[0])
                : []),

            file_name: metadata.fileName ?? null,
            file_type: metadata.fileType ?? null,
            sheet_name: metadata.sheetName ?? null,
          }),
        }
      );

      const savedDataset = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          savedDataset?.message ||
            savedDataset?.error ||
            "Could not upload the dataset."
        );
      }

      if (!savedDataset?.id) {
        throw new Error(
          "The backend did not return a dataset ID."
        );
      }

      setDatasetId(savedDataset.id);
      applyRows(rows, uploadedColumns);

      return savedDataset;
    } catch (uploadError) {
      console.error("Upload data error:", uploadError);

      setError(
        uploadError.message ||
          "An error occurred while uploading the dataset."
      );

      throw uploadError;
    }
  };

  /**
   * Called when the user selects a CSV, XLS, or XLSX file.
   */
  const handleDataFile = async (file) => {
    if (!file) {
      return null;
    }

    setIsUploadingFile(true);
    setError("");

    try {
      const result = await parseDataFile(file);

      /*
       * Excel workbook containing several sheets.
       * Open the selection dialog instead of uploading yet.
       */
      if (result.requiresSheetSelection) {
        setExcelImport({
          isOpen: true,
          fileName: result.fileName,
          workbook: result.workbook,
          sheetNames: result.sheetNames,
          selectedSheet: result.sheetNames[0] ?? "",
        });

        return {
          requiresSheetSelection: true,
          sheetNames: result.sheetNames,
        };
      }

      /*
       * CSV or Excel workbook containing one sheet.
       */
      await uploadData(
        result.rows,
        result.columns,
        {
          fileName: result.fileName,
          fileType: result.fileType,
          sheetName: result.sheetName,
        }
      );

      return result;
    } catch (fileError) {
      console.error("File import error:", fileError);

      setError(
        fileError.message ||
          "An error occurred while importing the file."
      );

      throw fileError;
    } finally {
      setIsUploadingFile(false);
    }
  };

  /**
   * Updates the selected worksheet in the dialog.
   */
  const selectExcelSheet = (sheetName) => {
    setExcelImport((currentImport) => ({
      ...currentImport,
      selectedSheet: sheetName,
    }));
  };

  /**
   * Parses and uploads the selected Excel worksheet.
   */
  const confirmExcelSheet = async () => {
    const {
      workbook,
      selectedSheet,
      fileName,
    } = excelImport;

    if (!workbook) {
      setError("The Excel workbook is not loaded.");
      return null;
    }

    if (!selectedSheet) {
      setError("Select an Excel worksheet.");
      return null;
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

      setExcelImport({
        isOpen: false,
        fileName: "",
        workbook: null,
        sheetNames: [],
        selectedSheet: "",
      });

      return savedDataset;
    } catch (sheetError) {
      console.error(
        "Excel sheet import error:",
        sheetError
      );

      setError(
        sheetError.message ||
          "Could not import the selected worksheet."
      );

      throw sheetError;
    } finally {
      setIsUploadingFile(false);
    }
  };

  /**
   * Closes the worksheet selection dialog.
   */
  const cancelExcelImport = () => {
    setExcelImport({
      isOpen: false,
      fileName: "",
      workbook: null,
      sheetNames: [],
      selectedSheet: "",
    });
  };


  const clearError = () => {
    setError("");
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
    error,
    clearError,

    excelImport,
    selectExcelSheet,
    confirmExcelSheet,
    cancelExcelImport,

    handleDataFile,
    uploadData,
    saveChartToBackend,
  };
}

export default useProjectData;