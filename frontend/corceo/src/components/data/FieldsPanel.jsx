function FieldsPanel({
  columns = [],
  onDragStart,
}) {
  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Header */}
      <div className="p-3 border-b bg-white">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Fields
        </h3>
      </div>

      {/* Fields */}
      <div className="p-2 space-y-2 overflow-y-auto">
        {columns.length === 0 ? (
          <div className="text-xs text-slate-400 p-3">
            No columns loaded
          </div>
        ) : (
          columns.map((col) => (
            <div
              key={col}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("col", col);
                onDragStart?.(e, col);
              }}
              className="
                px-3 py-2
                text-sm
                rounded-md
                border
                text-slate-700
                bg-white
                cursor-grab
                hover:bg-slate-50
                active:cursor-grabbing
              "
            >
              {col}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FieldsPanel;