function StoryTopToolbar({
  navigate,
  storyName,
  storyNameBeforeEditRef,
  setStoryName,
  commitStoryHistory,
  storyHistoryState,
  undoStory,
  canUndoStory,
  redoStory,
  canRedoStory,
  exportStoryPDF,
  publishStory,
  saveStory,
  isBusy = false,
}) {
  return (
    <div className="app-surface app-border h-12 shrink-0 flex items-center border-b px-4 gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={isBusy}
        className="app-text-muted text-sm hover:text-[rgb(var(--color-text))] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Back to projects
      </button>

      <div className="h-6 w-px bg-[rgb(var(--color-border))]" />

      <input
        value={storyName}
        disabled={isBusy}
        onFocus={() => {
          storyNameBeforeEditRef.current = storyName;
        }}
        onChange={(event) => {
          setStoryName(event.target.value, {
            record: false,
          });
        }}
        onBlur={() => {
          const previousName = storyNameBeforeEditRef.current;

          if (previousName === storyName) {
            return;
          }

          commitStoryHistory(
            {
              ...storyHistoryState,
              storyName: previousName,
            },
            {
              ...storyHistoryState,
              storyName,
            }
          );
        }}
        className="
          bg-transparent
          app-text
          w-72
          border-none
          text-lg
          font-semibold
          outline-none
          disabled:opacity-50
        "
      />

      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={undoStory}
          disabled={isBusy || !canUndoStory}
          title="Undo (Ctrl+Z)"
          className="
            btn-secondary rounded-lg px-3 py-2 text-sm
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          ↶ Undo
        </button>

        <button
          type="button"
          onClick={redoStory}
          disabled={isBusy || !canRedoStory}
          title="Redo (Ctrl+Shift+Z)"
          className="
            btn-secondary rounded-lg px-3 py-2 text-sm
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          ↷ Redo
        </button>

        <button
          type="button"
          onClick={exportStoryPDF}
          disabled={isBusy}
          className="
            btn-secondary px-4 py-2 text-sm rounded-lg
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          Export
        </button>

        <button
          type="button"
          onClick={publishStory}
          disabled={isBusy}
          className="
            btn-secondary px-4 py-2 text-sm rounded-lg
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          Publish
        </button>

        <button
          type="button"
          onClick={saveStory}
          disabled={isBusy}
          className="
            btn-primary px-4 py-2 text-sm rounded-lg
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default StoryTopToolbar;