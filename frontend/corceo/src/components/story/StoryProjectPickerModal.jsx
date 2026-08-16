function StoryProjectPickerModal({
  showPicker,
  setShowPicker,
  search,
  setSearch,
  availableProjects,
  handleProjectClick,
}) {
  if (!showPicker) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="app-card w-full max-w-xl h-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="app-border flex justify-between items-center px-5 py-4 border-b">
          <h2 className="app-text text-base font-bold">
            Select Project Element Block
          </h2>

          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="app-text-muted hover:text-[rgb(var(--color-text))] font-bold"
          >
            ✕
          </button>
        </div>

        {/* SEARCH */}
        <div className="app-surface-secondary app-border p-3 border-b">
          <input
            type="text"
            placeholder="Search matching visualization layouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input w-full rounded-xl p-2.5 text-xs"
          />
        </div>

        {/* PROJECT LIST */}
        <div className="app-surface-secondary flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            {availableProjects
              .filter(
                (project) =>
                  project.has_chart &&
                  project.chart_id &&
                  project.name
                    ?.toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )
              )
                .map((project) => (
                <div
                  key={project.id}
                  onClick={() =>
                    handleProjectClick(
                      project.id
                    )
                  }
                  className="app-card hover:border-[rgb(var(--color-primary))] rounded-xl p-3 cursor-pointer shadow-2xs transition-all items-center gap-3 group"
                >
                  <div className="app-surface-secondary app-border flex-1 border-b flex items-center justify-center">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-24 object-contain"
                      />
                    ) : (
                      <div className="app-text-muted w-full h-24 flex items-center justify-center">
                        📊
                      </div>
                    )}
                  </div>

                  <div className="app-text-secondary font-semibold text-xs truncate mt-2">
                    {project.name}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryProjectPickerModal;