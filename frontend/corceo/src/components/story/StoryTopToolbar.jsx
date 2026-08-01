
function StoryTopToolbar({
  navigate,storyName,storyNameBeforeEditRef,setStoryName,commitStoryHistory,storyHistoryState,undoStory,canUndoStory,redoStory,canRedoStory,exportStoryPDF,publishStory,saveStory
}) {
  return (
          <div className="app-surface app-border h-12 shrink-0 flex items-center border-b px-4 gap-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="app-text-muted text-sm hover:text-[rgb(var(--color-text))]"
          >
            ← Back to projects
          </button>

          <div className="h-6 w-px bg-[rgb(var(--color-border))]" />

          <input
            value={storyName}
            onFocus={() => {
              storyNameBeforeEditRef.current =
                storyName;
            }}
            onChange={(event) => {
              setStoryName(
                event.target.value,
                {
                  record: false,
                },
              );
            }}
            onBlur={() => {
      const previousName =
        storyNameBeforeEditRef.current;

      if (
        previousName === storyName
      ) {
        return;
      }

      commitStoryHistory(
        {
          ...storyHistoryState,
          storyName:
            previousName,
        },
        {
          ...storyHistoryState,
          storyName,
        },
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
    "
    />

          <div className="ml-auto flex gap-2">

          <button
            type="button"
            onClick={undoStory}
            disabled={!canUndoStory}
            title="Undo (Ctrl+Z)"
            className="
              btn-secondary
              rounded-lg
              px-3
              py-2
              text-sm
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ↶ Undo
          </button>

          <button
            type="button"
            onClick={redoStory}
            disabled={!canRedoStory}
            title="Redo (Ctrl+Shift+Z)"
            className="
              btn-secondary
              rounded-lg
              px-3
              py-2
              text-sm
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ↷ Redo
          </button>
            <button
              onClick={exportStoryPDF}
              className="btn-secondary px-4 py-2 text-sm rounded-lg"
            >
              Export
            </button>

            {/* Later */}
              <button
                onClick={publishStory}
                className="btn-secondary px-4 py-2 text-sm rounded-lg"
              >
                Publish
              </button> 

            <button
              onClick={saveStory}
              className="btn-primary px-4 py-2 text-sm rounded-lg"
            >
              Save
            </button>

          </div>
        </div>

  );
}

export default StoryTopToolbar;
