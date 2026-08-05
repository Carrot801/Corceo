import { useRef, useState } from "react";

function DataTable({
  data,
  setData,
  columns,
  setColumns,
  datasetId,

  // Handles raw CSV, XLS, and XLSX files.
  handleDataFile,

  isUploadingFile = false,

  // Optional chart-related props.
  setChartConfig = null,
  enableDrag = false,
  compactMode = false,
}) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef(null);

  // -----------------------------------
  // FILE VALIDATION
  // -----------------------------------
  const isSupportedFile = (file) => {
    if (!file?.name) {
      return false;
    }

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    return [".csv", ".xls", ".xlsx"].includes(extension);
  };

  // -----------------------------------
  // PROCESS SELECTED OR DROPPED FILE
  // -----------------------------------
  const processFile = async (file) => {
    if (!file) {
      return;
    }

    if (!isSupportedFile(file)) {
      alert("Please select a CSV, XLS, or XLSX file.");
      return;
    }

    if (!handleDataFile) {
      console.error(
        "DataTable requires a handleDataFile function."
      );
      return;
    }

    try {
      await handleDataFile(file);
    } catch (error) {
      console.error("File import failed:", error);
    }
  };

  // -----------------------------------
  // FILE INPUT
  // -----------------------------------
  const handleInputChange = async (event) => {
    const file = event.target.files?.[0];

    try {
      await processFile(file);
    } finally {
      // Allows selecting the same file again.
      event.target.value = "";
    }
  };

  // -----------------------------------
  // FILE DROP
  // -----------------------------------
  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDraggingFile(false);

    if (isUploadingFile) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    await processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!isUploadingFile) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (event) => {
    /*
     * Prevents flickering when moving over child elements.
     */
    if (
      event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      return;
    }

    setIsDraggingFile(false);
  };

  // -----------------------------------
  // COLUMN RENAME
  // -----------------------------------
  const handleColumnRename = (
    index,
    newColumnName
  ) => {
    const oldColumnName = columns[index];
    const trimmedName = newColumnName.trim();

    if (
      !trimmedName ||
      trimmedName === oldColumnName
    ) {
      return;
    }

    const duplicateExists = columns.some(
      (column, columnIndex) =>
        columnIndex !== index &&
        column === trimmedName
    );

    if (duplicateExists) {
      alert(
        `A column named "${trimmedName}" already exists.`
      );
      return;
    }

    const updatedColumns = [...columns];
    updatedColumns[index] = trimmedName;

    const updatedData = data.map((row) => {
      const updatedRow = {};

      columns.forEach((column) => {
        if (column === oldColumnName) {
          updatedRow[trimmedName] =
            row[oldColumnName] ?? "";
        } else {
          updatedRow[column] = row[column] ?? "";
        }
      });

      return updatedRow;
    });

    setColumns(updatedColumns);
    setData(updatedData);

    if (setChartConfig) {
      setChartConfig((previousConfig) => ({
        ...previousConfig,

        x:
          previousConfig.x === oldColumnName
            ? trimmedName
            : previousConfig.x,

        y: Array.isArray(previousConfig.y)
          ? previousConfig.y.map((field) =>
              field === oldColumnName
                ? trimmedName
                : field
            )
          : [],
      }));
    }
  };

  // -----------------------------------
  // CELL EDITING
  // -----------------------------------
  const handleCellChange = (
    rowIndex,
    column,
    value
  ) => {
    setData((previousData) =>
      previousData.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [column]: value,
            }
          : row
      )
    );
  };

  // -----------------------------------
  // ADD ROW
  // -----------------------------------
  const handleAddRow = () => {
    const emptyRow = {};

    columns.forEach((column) => {
      emptyRow[column] = "";
    });

    setData((previousData) => [
      ...previousData,
      emptyRow,
    ]);
  };

  // -----------------------------------
  // DELETE ROW
  // -----------------------------------
  const handleDeleteRow = (rowIndex) => {
    setData((previousData) =>
      previousData.filter(
        (_, index) => index !== rowIndex
      )
    );
  };

  // -----------------------------------
  // ADD COLUMN
  // -----------------------------------
  const handleAddColumn = () => {
    let columnNumber = columns.length + 1;
    let newColumnName = `Column ${columnNumber}`;

    while (columns.includes(newColumnName)) {
      columnNumber += 1;
      newColumnName = `Column ${columnNumber}`;
    }

    setColumns((previousColumns) => [
      ...previousColumns,
      newColumnName,
    ]);

    setData((previousData) =>
      previousData.map((row) => ({
        ...row,
        [newColumnName]: "",
      }))
    );
  };

  // -----------------------------------
  // DELETE COLUMN
  // -----------------------------------
  const handleDeleteColumn = (
    columnToDelete
  ) => {
    const updatedColumns = columns.filter(
      (column) => column !== columnToDelete
    );

    const updatedData = data.map((row) => {
      const updatedRow = { ...row };

      delete updatedRow[columnToDelete];

      return updatedRow;
    });

    setColumns(updatedColumns);
    setData(updatedData);

    if (setChartConfig) {
      setChartConfig((previousConfig) => ({
        ...previousConfig,

        x:
          previousConfig.x === columnToDelete
            ? null
            : previousConfig.x,

        y: Array.isArray(previousConfig.y)
          ? previousConfig.y.filter(
              (field) =>
                field !== columnToDelete
            )
          : [],

        filters: Array.isArray(
          previousConfig.filters
        )
          ? previousConfig.filters.filter(
              (filter) =>
                filter.field !== columnToDelete
            )
          : [],
      }));
    }
  };

  // -----------------------------------
  // COLUMN DRAG
  // -----------------------------------
  const handleColumnDragStart = (
    event,
    column
  ) => {
    if (!enableDrag) {
      return;
    }

    event.dataTransfer.setData(
      "col",
      column
    );

    event.dataTransfer.effectAllowed =
      "copy";
  };

  // -----------------------------------
  // QUICK COLUMN SELECT
  // -----------------------------------
  const handleColumnClick = (column) => {
    if (!setChartConfig) {
      return;
    }

    setChartConfig((previousConfig) => {
      if (!previousConfig.x) {
        return {
          ...previousConfig,
          x: column,
        };
      }

      const currentY = Array.isArray(
        previousConfig.y
      )
        ? previousConfig.y
        : [];

      if (
        previousConfig.x !== column &&
        !currentY.includes(column)
      ) {
        return {
          ...previousConfig,
          y: [...currentY, column],
        };
      }

      return previousConfig;
    });
  };

  // -----------------------------------
  // FILE UPLOAD BUTTON
  // -----------------------------------
  const FileUploadButton = () => (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={handleInputChange}
        disabled={isUploadingFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={isUploadingFile}
        className="
          rounded-md
          bg-slate-700
          px-3
          py-1.5
          text-xs
          font-medium
          text-white
          hover:bg-slate-800
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isUploadingFile
          ? "Importing..."
          : "Import CSV or Excel"}
      </button>
    </>
  );

  // -----------------------------------
  // EMPTY STATE
  // -----------------------------------
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          m-4
          flex
          min-h-[300px]
          flex-1
          flex-col
          items-center
          justify-center
          rounded-lg
          border-2
          border-dashed
          transition-colors
          ${
            isDraggingFile
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 text-slate-400"
          }
        `}
      >
        <p className="text-sm font-medium">
          Drop a CSV or Excel file here
        </p>

        <p className="mt-1 text-xs">
          Supported formats: CSV, XLS and XLSX
        </p>

        <div className="mt-4">
          <FileUploadButton />
        </div>

        {!Array.isArray(data) && data && (
          <p className="mt-2 text-xs text-red-500">
            Failed to load data correctly
            from the server.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        h-full
        w-full
        overflow-auto
        ${
          compactMode
            ? "text-xs"
            : "text-sm"
        }
        ${
          isDraggingFile
            ? "bg-blue-50"
            : ""
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* TOP ACTION BAR */}
      <div
        className="
          sticky
          top-0
          z-20
          flex
          items-center
          gap-2
          border-b
          bg-white
          p-3
        "
      >
        <FileUploadButton />

        <button
          type="button"
          onClick={handleAddRow}
          className="
            rounded-md
            bg-blue-500
            px-3
            py-1.5
            text-xs
            font-medium
            text-white
            hover:bg-blue-600
          "
        >
          Add Row
        </button>

        <button
          type="button"
          onClick={handleAddColumn}
          className="
            rounded-md
            bg-green-500
            px-3
            py-1.5
            text-xs
            font-medium
            text-white
            hover:bg-green-600
          "
        >
          Add Column
        </button>

        {datasetId && (
          <span className="ml-auto text-xs text-slate-400">
            Dataset #{datasetId}
          </span>
        )}
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead className="sticky top-[53px] z-10 bg-slate-900 text-white">
          <tr>
            <th className="w-14 border px-3 py-2">
              #
            </th>

            {columns.map((column, index) => (
              <th
                key={column}
                draggable={enableDrag}
                onDragStart={(event) =>
                  handleColumnDragStart(
                    event,
                    column
                  )
                }
                className="
                  min-w-[180px]
                  border
                  px-3
                  py-2
                  text-left
                "
              >
                <div className="flex items-center gap-2">
                  <input
                    value={column}
                    onClick={() =>
                      handleColumnClick(column)
                    }
                    onChange={(event) =>
                      handleColumnRename(
                        index,
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      cursor-pointer
                      bg-transparent
                      font-semibold
                      outline-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteColumn(
                        column
                      )
                    }
                    className="
                      text-xs
                      text-red-300
                      hover:text-red-500
                    "
                    aria-label={`Delete ${column} column`}
                  >
                    ✕
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b hover:bg-slate-50"
            >
              <td className="border px-2 py-1 text-center">
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteRow(rowIndex)
                  }
                  className="
                    text-xs
                    text-red-500
                    hover:text-red-700
                  "
                >
                  Delete
                </button>
              </td>

              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="border px-2 py-1"
                >
                  <input
                    value={row[column] ?? ""}
                    onChange={(event) =>
                      handleCellChange(
                        rowIndex,
                        column,
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      bg-transparent
                      px-1
                      outline-none
                    "
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTab