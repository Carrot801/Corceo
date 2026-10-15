import React, {
  useEffect,
  useRef,
  useState
} from "react";

import StoryChart from "../StoryChart";
import AnnotationLayer from "../annotations/AnnotationLayer";

function StorySlideContent({
  slide,
  slideIndex = 0,

  interactive = false,
  exportMode = false,

  canvasRef: externalCanvasRef = null,

  selectedChartId = null,
  selectedAnnoId = null,

  setSelectedChartId,
  setSelectedAnnoId,

  startChartInteraction,
  duplicateChartItem,
  deleteChartItem,
  sendChartToBack,

  setShowPicker,
  handleDragStart,

  canvasDimensions: externalCanvasDimensions = null
}) {
  const internalCanvasRef = useRef(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  const [internalCanvasDimensions, setInternalCanvasDimensions] =
    useState({
      width: 0,
      height: 0
    });

  const [hoveredChartId, setHoveredChartId] = useState(null);

  const isInteractive = interactive && !exportMode;

  useEffect(() => {
    const element = canvasRef.current;

    if (externalCanvasDimensions || !element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        setInternalCanvasDimensions((previous) => {
          if (
            previous.width === width &&
            previous.height === height
          ) {
            return previous;
          }

          return { width, height };
        });
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [canvasRef, externalCanvasDimensions]);

  const canvasDimensions =
    externalCanvasDimensions || internalCanvasDimensions;

  const safeSlide = slide || {
    content: [],
    annotations: []
  };

  const content = safeSlide.content || [];

  const openChartPicker = (event) => {
    event.stopPropagation();
    setShowPicker?.(true);
  };


  useEffect(() => {
  if (!isInteractive) {
    return;
  }

  const handleOutsideClick = (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const chartElement = target.closest(
      '[data-story-chart="true"]'
    );

    if (
      chartElement &&
      canvasRef.current?.contains(chartElement)
    ) {
      return;
    }

    setSelectedChartId?.(null);
  };

  document.addEventListener(
    "pointerdown",
    handleOutsideClick,
    true
  );

  return () => {
    document.removeEventListener(
      "pointerdown",
      handleOutsideClick,
      true
    );
  };
}, [isInteractive, canvasRef, setSelectedChartId]);

  return (
    <div
      ref={canvasRef}
      className="
        story-visual-canvas
        relative
        h-full
        w-full
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
      "
      onClick={(event) => {
        if (
          !isInteractive ||
          event.target !== event.currentTarget
        ) {
          return;
        }

        setSelectedAnnoId?.(null);
        setSelectedChartId?.(null);
      }}
    >
      {/* Charts stay inside their own stacking layer. */}
      <div
        className="
          absolute
          inset-0
          z-[5]
          overflow-visible
          rounded-xl
        "
      >
        {content.map((item) => {
          const isSelected =
            isInteractive && selectedChartId === item.id;

          return (
            <div
              key={item.id}
              data-story-chart="true"
              className={`
                absolute
                group
                rounded-xl
                ${isInteractive ? "transition-shadow" : ""}
                ${
                  isSelected
                    ? "ring-2 ring-[rgb(var(--color-primary))] shadow-xl"
                    : isInteractive
                      ? "hover:ring-1 hover:ring-[rgb(var(--color-border-strong))]"
                      : ""
                }
              `}
              style={{
                left: `${item.x ?? 5}%`,
                top: `${item.y ?? 5}%`,
                width: `${item.width ?? 48}%`,
                height: `${item.height ?? 45}%`,
                zIndex:
                  isInteractive && hoveredChartId === item.id
                    ? 10000
                    : (item.zIndex ?? 1)
              }}
              onMouseEnter={
                isInteractive
                  ? () => setHoveredChartId(item.id)
                  : undefined
              }
              onMouseLeave={
                isInteractive
                  ? () => setHoveredChartId(null)
                  : undefined
              }
              onMouseDown={
                isInteractive
                  ? (event) => {
                      event.stopPropagation();
                      setSelectedChartId?.(item.id);
                      setSelectedAnnoId?.(null);
                    }
                  : undefined
              }
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-visible
                  rounded-sm
                  bg-white
                "
              >
                {isInteractive && (
                  <div
                    className={`
                      absolute
                      left-0
                      right-0
                      top-0
                      z-20
                      flex
                      h-9
                      items-center
                      justify-between
                      border-b
                      border-[rgb(var(--color-border))]
                      bg-[rgb(var(--color-surface))]/90
                      px-2
                      backdrop-blur-sm
                      transition-opacity
                      ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }
                    `}
                  >
                    <button
                      type="button"
                      title="Drag chart"
                      className="
                        app-text-secondary
                        min-w-0
                        flex-1
                        cursor-move
                        truncate
                        text-left
                        text-[11px]
                        font-semibold
                      "
                      onMouseDown={(event) => {
                        startChartInteraction?.(
                          event,
                          "move",
                          item
                        );
                      }}
                    >
                      ⋮⋮ {item.name || "Chart"}
                    </button>

                    <div className="ml-2 flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="Send backward"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          sendChartToBack?.(item.id);
                        }}
                        className="app-icon-button h-6 w-6 rounded text-xs"
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        title="Duplicate chart"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          duplicateChartItem?.(item.id);
                        }}
                        className="app-icon-button h-6 w-6 rounded text-xs"
                      >
                        ⧉
                      </button>

                      <button
                        type="button"
                        title="Delete chart"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteChartItem?.(item.id);
                        }}
                        className="
                          app-icon-button
                          h-6
                          w-6
                          rounded
                          text-xs
                          text-[rgb(var(--color-danger))]
                        "
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                <div className="h-full w-full bg-white">
                  <StoryChart
                    chartId={item.chartId}
                    exportMode={exportMode}
                    storyMode
                  />
                </div>

                {isSelected && (
                  <>
                    <div
                      onMouseDown={(event) => {
                        startChartInteraction?.(
                          event,
                          "top",
                          item
                        );
                      }}
                      className="
                        absolute
                        left-3
                        right-3
                        top-0
                        z-30
                        h-2
                        -translate-y-1/2
                        cursor-n-resize
                      "
                    />

                    <div
                      onMouseDown={(event) => {
                        startChartInteraction?.(
                          event,
                          "bottom",
                          item
                        );
                      }}
                      className="
                        absolute
                        bottom-0
                        left-3
                        right-3
                        z-30
                        h-2
                        translate-y-1/2
                        cursor-s-resize
                      "
                    />

                    <div
                      onMouseDown={(event) => {
                        startChartInteraction?.(
                          event,
                          "left",
                          item
                        );
                      }}
                      className="
                        absolute
                        bottom-3
                        left-0
                        top-3
                        z-30
                        w-2
                        -translate-x-1/2
                        cursor-w-resize
                      "
                    />

                    <div
                      onMouseDown={(event) => {
                        startChartInteraction?.(
                          event,
                          "right",
                          item
                        );
                      }}
                      className="
                        absolute
                        bottom-3
                        right-0
                        top-3
                        z-30
                        w-2
                        translate-x-1/2
                        cursor-e-resize
                      "
                    />

                    {[
                      [
                        "top-left",
                        "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize"
                      ],
                      [
                        "top-right",
                        "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize"
                      ],
                      [
                        "bottom-left",
                        "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize"
                      ],
                      [
                        "bottom-right",
                        "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize"
                      ]
                    ].map(([mode, position]) => (
                      <button
                        key={mode}
                        type="button"
                        aria-label={`Resize chart from ${mode}`}
                        onMouseDown={(event) => {
                          startChartInteraction?.(
                            event,
                            mode,
                            item
                          );
                        }}
                        className={`
                          absolute
                          z-40
                          h-3
                          w-3
                          rounded-sm
                          border
                          border-[rgb(var(--color-surface))]
                          bg-[rgb(var(--color-primary))]
                          shadow
                          ${position}
                        `}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {isInteractive && content.length === 0 && (
          <button
            type="button"
            onClick={openChartPicker}
            className="
              app-text-muted
              flex
              h-full
              w-full
              flex-col
              items-center
              justify-center
              gap-2
              rounded-lg
              border-2
              border-dashed
              border-[rgb(var(--color-border-strong))]
              transition-all
              hover:bg-[rgb(var(--color-surface-hover))]
            "
          >
            <span className="text-2xl">📊</span>

            <span className="text-xs font-semibold">
              Add your first chart
            </span>
          </button>
        )}
      </div>

      {/* Outside the chart layer so hovered charts cannot cover it. */}
      {isInteractive && content.length > 0 && (
        <button
          type="button"
          data-pdf-hide="true"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onClick={openChartPicker}
          className="
            btn-primary
            absolute
            bottom-3
            right-3
            z-[45]
            rounded-lg
            px-3
            py-2
            text-xs
            shadow-lg
          "
        >
          + Add chart
        </button>
      )}

      <AnnotationLayer
        annotations={safeSlide.annotations || []}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        interactive={isInteractive}
        selectedAnnoId={isInteractive ? selectedAnnoId : null}
        onSelect={
          isInteractive
            ? (annotationId) => {
                setSelectedAnnoId?.(annotationId);
                setSelectedChartId?.(null);
              }
            : undefined
        }
        onDragStart={
          isInteractive ? handleDragStart : undefined
        }
        idPrefix={
          isInteractive
            ? `story-editor-${slideIndex}`
            : `story-export-${slideIndex}`
        }
      />
    </div>
  );
}

export default StorySlideContent;