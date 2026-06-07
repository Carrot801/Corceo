import React, { useState } from "react";
function FieldsPanel({
  columns = [],
  onDragStart,
  types = {},
  isUsed,
  setChartConfig,
}) 
{
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, col: null });
  const handleContextMenu = (e, col) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, col });
  };
  const isCurrentlyUsed = (col) => isUsed(col);
    const [searchField, setSearchField] = useState("");
    const filteredColumns = columns.filter(col => 
      col.toLowerCase().includes(searchField.toLowerCase())
    );
    const getIcon = (col) => {
      console.log("Looking for column:", col, "in types object:", types);
      const type = types[col];
            console.log("sldfkj",isUsed(col));

      if (type === 'number') return '123';
      if (type === 'date') return '📅';
      return 'abc';
    };
  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Header */}
      <div className={`${isUsed ? "bg-blue-50 border-blue-200" : "bg-white"} p-3 border-b`}>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Fields
        </h3>
      </div>
      <div className="p-3 border-b bg-white">
        <input 
        placeholder="Find a field..." 
        onChange={(e) => setSearchField(e.target.value)} 
      />
      </div>
      
      {/* Fields */}
      <div className="p-2 space-y-2 overflow-y-auto">
        {filteredColumns.length === 0 ? (
          <div className="text-xs text-slate-400 p-3">
            No fields found
          </div>
        ) : (
          filteredColumns.map((col) => (
            <div
              key={col}
              draggable
              onContextMenu={(e) => handleContextMenu(e, col)}
              onDragStart={(e) => {
                e.dataTransfer.setData("col", col);
                onDragStart?.(e, col);
              }}
              onDoubleClick={() => {
                if (!setChartConfig) return;
                const type = types[col];
                setChartConfig(prev => {
                  if (type === 'number' && !prev.y) return { ...prev, y: col };
                  if (!prev.x) return { ...prev, x: col };
                  return prev;
                });
              }}
              className={`
                px-3 py-2
                text-sm
                rounded-md
                border
                flex
                items-center
                justify-between
                cursor-grab
                hover:bg-slate-50
                active:cursor-grabbing
                ${isCurrentlyUsed(col) ? "border-blue-500 bg-blue-50 text-blue-500" : "border-slate-200 text-slate-700"}
              `}
            >
              {contextMenu.visible && (
            <div 
              className="fixed bg-white border shadow-md rounded-md z-50 p-1 w-32"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onMouseLeave={() => setContextMenu({ visible: false })}
              onClick={() => setContextMenu({ visible: false })} // Close on click
            >
              <button 
                className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-50"
                onClick={() => { setChartConfig(prev => ({...prev, x: contextMenu.col})); setContextMenu({visible: false}); }}
              >
                Add to X Axis
              </button>
              <button 
                className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-50"
                onClick={() => { setChartConfig(prev => ({...prev, y: contextMenu.col})); setContextMenu({visible: false}); }}
              >
                Add to Y Axis
              </button>
              {types[contextMenu.col] === 'number' && (
                <>
                  <div className="border-b my-1"></div>
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Aggregation</div>
                  <button className="block w-full text-left px-2 py-1 text-sm hover:bg-slate-100" 
                    onClick={() => { setChartConfig(prev => ({...prev, sort: contextMenu.col})); setContextMenu({visible: false}); }}>
                    Sort by this field
                  </button>
                </>
              )}
            </div>
          )}
             
              {col}
               <span className="text-slate-400 font-mono text-xs">
                {getIcon(col)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FieldsPanel;