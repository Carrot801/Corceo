import SlideThumbnail from "./SlideThumbnail";

function StorySlidesSidebar({
  slides,
  activeSlideIndex,
  setActiveSlideIndex,
  setSelectedAnnoId,
  setSelectedChartId,
  duplicateSlide,
  deleteSlide,
  addSlide,
  reorderSlides,
}) {
  return (
          <div
            className="
              app-surface
              app-border
              flex
              w-72
              shrink-0
              flex-col
              gap-4
              border-r
              p-4
            "
          >
            <div className="flex items-center justify-between">
              <h2 className="app-text text-sm font-semibold">
                Slides
              </h2>

              <span className="app-text-muted text-xs">
                {slides.length}
              </span>
            </div>        
            <div
              className="
                flex
                min-h-0
                w-full
                flex-1
                flex-col
                gap-3
                overflow-y-auto
                pr-1
              "
            >
              {slides.map((slide, index) => {

                const isActive =
                  activeSlideIndex === index;

                return (
                  <div
                  key={slide.id}

                  draggable

                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed =
                      "move";

                    event.dataTransfer.setData(
                      "text/plain",
                      String(index)
                    );
                  }}

                  onDragOver={(event) => {
                    event.preventDefault();

                    event.dataTransfer.dropEffect =
                      "move";
                  }}

                  onDrop={(event) => {
                    event.preventDefault();

                    const fromIndex =
                      Number(
                        event.dataTransfer.getData(
                          "text/plain"
                        )
                      );

                    const toIndex =
                      index;

                    if (
                      !Number.isInteger(fromIndex) ||
                      fromIndex === toIndex
                    ) {
                      return;
                    }

                    reorderSlides(
                      fromIndex,
                      toIndex
                    );
                  }}

                  className="
                    group
                    flex
                    w-full
                    shrink-0
                    gap-2
                    cursor-grab
                    active:cursor-grabbing
                  "
                >
                {/* Slide number + drag handle */}
                <div
                  className="
                    app-text-muted
                    flex
                    w-5
                    shrink-0
                    flex-col
                    items-center
                    pt-3
                  "
                >
                  {/* Number */}
                  <span className="text-[11px] font-semibold">
                    {index + 1}
                  </span>

                  {/* Drag handle */}
                  <div
                    draggable
                    title="Drag to reorder slide"

                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed =
                        "move";

                      event.dataTransfer.setData(
                        "text/plain",
                        String(index)
                      );
                    }}

                    className="
                      mt-1
                      cursor-grab
                      select-none
                      text-sm
                      leading-none
                      opacity-60
                      hover:opacity-100
                      active:cursor-grabbing
                    "
                  >
                    ⋮⋮
                  </div>
                </div>
                    {/* Slide thumbnail */}
                    <div
                      onClick={() => {
                        setActiveSlideIndex(index);
                        setSelectedAnnoId(null);
                        setSelectedChartId(null);
                      }}
                      className={`
                        relative
                        aspect-video
                        min-w-0
                        flex-1
                        cursor-pointer
                        overflow-hidden
                        rounded-lg
                        border
                        bg-white
                        shadow-sm
                        transition-all
                        ${
                          isActive
                            ? `
                              border-[rgb(var(--color-primary))]
                              ring-2
                              ring-[rgb(var(--color-highlight))]
                            `
                            : `
                              border-[rgb(var(--color-border))]
                              hover:border-[rgb(var(--color-border-strong))]
                              hover:shadow-md
                            `
                        }
                      `}
                    >
                      <SlideThumbnail
                        slide={slide}
                        slideNumber={index + 1}
                      />
                      {/* Active slide overlay */}
                      {isActive && (
                        <div className="pointer-events-none absolute inset-0 bg-[rgb(var(--color-primary))]/[0.03]" />
                      )}

                      {/* Slide actions */}
                      <div
                        className={`
                          absolute
                          right-1.5
                          top-1.5
                          z-20
                          flex
                          gap-1
                          transition-opacity
                          ${
                            isActive
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }
                        `}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => duplicateSlide(index)}
                          title="Duplicate slide"
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-slate-200
                            bg-white/95
                            text-xs
                            text-slate-700
                            shadow-sm
                            backdrop-blur-sm
                            hover:border-blue-400
                            hover:text-blue-600
                          "
                        >
                          ⧉
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSlide(index)}
                          title="Delete slide"
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-slate-200
                            bg-white/95
                            text-xs
                            text-slate-700
                            shadow-sm
                            backdrop-blur-sm
                            hover:border-red-400
                            hover:text-red-600
                          "
                        >
                          🗑
                        </button>
                      </div>

                      {/* Slide title */}
                      <div
                        className="
                          absolute
                          bottom-0
                          left-0
                          right-0
                          z-10
                          truncate
                          bg-gradient-to-t
                          from-black/65
                          to-transparent
                          px-2
                          pb-1.5
                          pt-5
                          text-[10px]
                          font-medium
                          text-white
                        "
                      >
                        {slide.description || `Slide ${index + 1}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        
            <button onClick={addSlide} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors">+ Add Slide</button>
          </div>

  );
}

export default StorySlidesSidebar;
