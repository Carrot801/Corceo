import DropUpload from "./DropUpload";
import { useState,useEffect } from "react";
import { apiRequest } from "../../api/client";
function DataTable({
  data,
  setData,
  columns,
  setColumns,
  datasetId,
  handleDataFile,
  isUploadingFile = false,
}) {

  const MIN_ROWS = 30;
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [columnError, setColumnError] = useState("");
  const [newColumnCreated, setNewColumnCreated] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [contextMenu, setContextMenu] =
  useState({
    visible: false,
    x: 0,
    y: 0,
    column: null,
  });
const addColumn = () => {
  const tempName = `__new_${Date.now()}__`;

  setData(prev =>
    prev.map(row => ({
      ...row,
      [tempName]: "",
    }))
  );

  setColumns(prev => [...prev, tempName]);

  setEditingColumn(tempName);
  setNewColumnName("");

  setNewColumnCreated(true);
};


const createColumn = async (columnName) => {
  return apiRequest("/data/columns/add", {
    method: "POST",
    body: JSON.stringify({
      dataset_id: datasetId,
      columnName,
      defaultValue: "",
    }),
  });
};


const renameColumn = async (oldName, newName) => {
  newName = newName.trim();

  if (!newName) {
    setColumnError("Column name is required");
    return;
  }

  if (
    columns.includes(newName) &&
    oldName !== newName
  ) {
    setColumnError("Column already exists");
    return;
  }

  try {
    if (newColumnCreated) {
      await createColumn(newName);

      const updated = data.map(row => {
        const newRow = { ...row };

        newRow[newName] = newRow[oldName];
        delete newRow[oldName];

        return newRow;
      });

      setData(updated);

      setColumns(prev =>
        prev.map(col =>
          col === oldName ? newName : col
        )
      );

      setNewColumnCreated(false);
    }else {
  await apiRequest(
    "/data/columns/rename",
    {
      method: "PUT",
      body: JSON.stringify({
        dataset_id: datasetId,
        oldName,
        newName,
      }),
    },
  );

  const updated = data.map((row) => {
    const newRow = { ...row };

    newRow[newName] =
      newRow[oldName];

    delete newRow[oldName];

    return newRow;
  });

  setData(updated);

  setColumns((prev) =>
    prev.map((col) =>
      col === oldName
        ? newName
        : col,
    ),
  );
}

    setColumnError("");
    setEditingColumn(null);

  } catch (err) {
    console.error(err);
    setColumnError(err.message);
  }
};
const deleteColumn = async (columnName) => {
  try {
    await apiRequest(
      "/data/columns/delete",
      {
        method: "DELETE",
        body: JSON.stringify({
          dataset_id: datasetId,
          columnName,
        }),
      },
    );

    setData((previous) =>
      previous.map((row) => {
        const nextRow = {
          ...row,
        };

        delete nextRow[
          columnName
        ];

        return nextRow;
      }),
    );

    setColumns((previous) =>
      previous.filter(
        (column) =>
          column !==
          columnName,
      ),
    );

    setSelectedColumn(null);
  } catch (err) {
    console.error(
      "Failed to delete column:",
      err,
    );
  }
};

  const handleCellChange = (
    rowIndex,
    col,
    value
  ) => {
    const updated = [...data];

    updated[rowIndex][col] = value;

    setData(updated);
  };

  const handleDragStart = (e, col) => {
    e.dataTransfer.setData("col", col);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
const handleDrop = async (event) => {
  event.preventDefault();

  if (isUploadingFile) {
    return;
  }

  const file =
    event.dataTransfer.files?.[0];

  if (!file) {
    return;
  }

  if (typeof handleDataFile !== "function") {
    console.error(
      "DataTable requires handleDataFile."
    );
    return;
  }

  try {
    await handleDataFile(file);
  } catch (error) {
    console.error(
      "File upload failed:",
      error
    );
  }
};
  
useEffect(() => {
  const handleKeyDown = (e) => {

    if (
      e.key === "Delete" &&
      selectedColumn
    ) {
      deleteColumn(selectedColumn);
    }

    if (
      e.ctrlKey &&
      e.key.toLowerCase() === "x" &&
      selectedColumn
    ) {
      e.preventDefault();

      deleteColumn(selectedColumn);
    }
    if (
      e.key === "F2" &&
      selectedColumn
    ) {
      setEditingColumn(selectedColumn);
      setNewColumnName(selectedColumn);
    }

  };

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  return () =>
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );

}, [selectedColumn, data]);
useEffect(() => {
  const closeMenu = () =>
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      column: null,
    });
  window.addEventListener(
    "click",
    closeMenu
  );

  return () =>
    window.removeEventListener(
      "click",
      closeMenu
    );

}, []);

  if (!data || data.length === 0 || !columns?.length) {
  return (
    <DropUpload
      handleDataFile={handleDataFile}
      isUploadingFile={isUploadingFile}
    />
  );
  }
  return (
    <div 
    className="w-full p-4 overflow-auto"
    onDrop={handleDrop}
    onDragOver={handleDragOver}
  >

      <table className="w-full border text-sm">

        <thead>
          <tr>
            {columns.map(col => (
            <th
              key={col}
              draggable
              onClick={() => setSelectedColumn(col)}
              onDoubleClick={() => {
                setEditingColumn(col);
                setNewColumnName(col);
              }}
              onDragStart={(e) => handleDragStart(e, col)}
              onContextMenu={(e) => {
                e.preventDefault();

                setSelectedColumn(col);

                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  column: col,
                });
              }}
              className={`
                border px-2 py-1 cursor-pointer
                ${selectedColumn === col
                  ? "bg-blue-600 text-white"
                  : "bg-black text-white"
                }
              `}
            >
              {
                editingColumn === col ? (
                  <input
                    autoFocus
                    placeholder="Column name"
                    value={newColumnName}
                    onChange={(e) =>
                      setNewColumnName(e.target.value)
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        renameColumn(
                          col,
                          newColumnName
                        );
                      }

                      if (e.key === "Escape") {

                        if (newColumnCreated) {

                          setData(prev =>
                            prev.map(row => {
                              const copy = { ...row };
                              delete copy[col];
                              return copy;
                            })
                          );

                          setColumns(prev =>
                            prev.filter(c => c !== col)
                          );

                          setNewColumnCreated(false);
                        }

                        setEditingColumn(null);
                        setColumnError("");
                      }

                    }}
                    className="text-black px-1"
                  />
                ) : (
                  col.startsWith("__new_")
                    ? ""
                    : col
                )
              }
            </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td
                  key={col}
                  className="border px-2 py-1"
                >
                  <input
                    value={row[col]}
                    onChange={(e) =>
                      handleCellChange(
                        i,
                        col,
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
      {columnError && (
        <div className="text-red-500 text-sm mt-2">
          {columnError}
        </div>
      )}
      {contextMenu.visible && (
      <div
        className="fixed bg-white border rounded shadow-lg z-50"
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
        }}
      >
        <button
          className="block w-full text-left px-4 py-2 hover:bg-red-50"
          onClick={() => {
            deleteColumn(contextMenu.column);

            setContextMenu({
              visible: false,
            });
          }}
        >
          Delete Column
        </button>

        <button
          className="block w-full text-left px-4 py-2 hover:bg-slate-100"
          onClick={() => {
            setEditingColumn(contextMenu.column);
            setNewColumnName(contextMenu.column);

            setContextMenu({
              visible: false,
            });
          }}
        >
          Rename Column
        </button>
        <button
          className="block w-full text-left px-4 py-2 hover:bg-green-50"
          onClick={() => {
            addColumn();
            setContextMenu({
              visible: false,
              x: 0,
              y: 0,
              column: null,
            });
          }}
        >
          Add Column
        </button>
      </div>
    )}
    </div>
  );
}

export default DataTable;