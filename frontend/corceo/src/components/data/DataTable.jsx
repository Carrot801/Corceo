import DropUpload from "./DropUpload";
import { useState,useEffect } from "react";
function DataTable({
  data,
  setData,
  columns,
  uploadCSV,
  setColumns,
  datasetId,
}) {

  const MIN_ROWS = 30;
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [contextMenu, setContextMenu] =
  useState({
    visible: false,
    x: 0,
    y: 0,
    column: null,
  });
  const addColumn = async () => {
  const columnName = prompt("Column name");

  if (!columnName?.trim()) return;

  if (columns.includes(columnName)) {
    alert("Column already exists");
    return;
  }

  try {
    await fetch(
      "http://localhost:5000/data/columns/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset_id: datasetId,
          columnName,
          defaultValue: "",
        }),
      }
    );

    const updated = data.map(row => ({
      ...row,
      [columnName]: "",
    }));

    setData(updated);
    setColumns(prev => [...prev, columnName]);

  } catch (err) {
    console.error(err);
  }
};
  const renameColumn = async (oldName, newName) => {
  if (!newName.trim()) return;
  if (columns.includes(newName)) {
    alert("Column already exists");
    return;
  }
  await fetch(
    `http://localhost:5000/data/columns/rename`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        datasetId,
        oldName,
        newName,
      }),
    }
  );

    const updatedData = data.map(row => {
    const newRow = { ...row };

    newRow[newName] = newRow[oldName];
    delete newRow[oldName];

    return newRow;
  });


  setData(updatedData);
  setColumns(prev =>
    prev.map(col =>
      col === oldName ? newName : col
    )
  );
  setEditingColumn(null);
  setNewColumnName("");
};

const deleteColumn = async(columnName) => {
  try{
    await fetch(
      "http://localhost:5000/data/columns/delete",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset_id: datasetId,
          columnName,
        }),
      }
    );
  } catch(err) {
    console.error(err);
    return;
  }
    
  const updated = data.map(row => {
    const newRow = { ...row };
    delete newRow[columnName];
    return newRow;
  });

  setData(updated);

  setColumns(prev =>
    prev.filter(col => col !== columnName)
  );

  setSelectedColumn(null);
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
  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    uploadCSV(file);
  };

  if (!data || data.length === 0 || !columns?.length) {
    return <DropUpload uploadCSV={uploadCSV} />;
  }
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
                        setEditingColumn(null);
                      }

                    }}
                    className="text-black px-1"
                  />
                ) : (
                  col
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