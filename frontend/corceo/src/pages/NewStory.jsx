import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useHistoryState from "../hooks/useHistoryState";

import StoryTopToolbar from "../components/story/StoryTopToolbar";
import StorySlidesSidebar from "../components/story/StorySlidesSidebar";
import StoryMainCanvas from "../components/story/StoryMainCanvas";
import StoryAnnotationsSidebar from "../components/story/StoryAnnotationsSidebar";
import StoryExportSlides from "../components/story/StoryExportSlides";
import StoryProjectPickerModal from "../components/story/StoryProjectPickerModal";
import useStoryPersistence from "../hooks/story/useStoryPersistence";
import useStoryExport
  from "../hooks/story/useStoryExport";
import useStorySlides
  from "../hooks/story/useStorySlides";
import { apiRequest } from "../api/client";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../utils/story/storyConstants";

const DEFAULT_CHART_ASPECT_RATIO = 16 / 9;

function createChartItem(
  chartId,
  name,
  imageUrl,
  index = 0,
) {
  const width = 100;

  return {
    id: `chart-${crypto.randomUUID()}`,
    type: "chart",
    chartId,
    name,
    imageUrl: imageUrl || null,

    x: 0,
    y: 0,

    width,
    height: 100,

    resizeMode: "free",
    aspectRatio: DEFAULT_CHART_ASPECT_RATIO,

    zIndex: index + 1,
  };
}


function NewStory() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const isSlideActionRef = useRef(false);

const createInitialStoryState =
  useCallback(
    () => ({
      storyName:
        "Untitled Story",

      slides: [
        {
          id:
            `temp-${crypto.randomUUID()}`,

          content: [],
          description: "",
          annotations: [],
        },
      ],
    }),
    [],
  );


  const [availableProjects, setAvailableProjects] = useState([]);
  const [search, setSearch] = useState("");

    const {
    state: storyHistoryState,
    setState: setStoryHistoryState,
    undo: undoStory,
    redo: redoStory,
    reset: resetStoryHistory,
    commit: commitStoryHistory,
    canUndo: canUndoStory,
    canRedo: canRedoStory,
  } = useHistoryState(
    createInitialStoryState,
    {
      maxHistory: 50,
    },
  );
  const setStoryName = (
  nextValueOrUpdater,
  options,
) => {
  setStoryHistoryState(
    (current) => ({
      ...current,

      storyName:
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              current.storyName,
            )
          : nextValueOrUpdater,
    }),
    options,
  );
};

const setSlides = (
  nextValueOrUpdater,
  options,
) => {
  setStoryHistoryState(
    (current) => ({
      ...current,

      slides:
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              current.slides,
            )
          : nextValueOrUpdater,
    }),
    options,
  );
};


const setSlidesDuringDrag = (
  nextValueOrUpdater,
) => {
  setStoryHistoryState(
    (currentStory) => {
      const updatedSlides =
        typeof nextValueOrUpdater ===
        "function"
          ? nextValueOrUpdater(
              currentStory.slides,
            )
          : nextValueOrUpdater;

      const updatedStory = {
        ...currentStory,
        slides: updatedSlides,
      };

      // Latest state for other code.
      storyStateRef.current =
        updatedStory;

      // Exact latest state for this drag.
      if (dragContext.current) {
        dragContext.current.latestStoryState =
          updatedStory;
      }

      return updatedStory;
    },
    {
      record: false,
    },
  );
};

const {
  storyName,
  slides,
} = storyHistoryState;

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedAnnoId, setSelectedAnnoId] = useState(null);
  const [selectedChartId, setSelectedChartId] = useState(null);

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  const canvasRef = useRef(null);
  const dragContext = useRef({ type: null, annoId: null });
  const chartInteractionRef = useRef(null);

  const currentSlide = slides[activeSlideIndex] || { content: [], annotations: [], description: "" };

  const storyStateRef =
  useRef(storyHistoryState);

  const storyNameBeforeEditRef =
  useRef(storyName);

useEffect(() => {
  storyStateRef.current =
    storyHistoryState;
}, [storyHistoryState]);

  // Observe canvas wrapper resizes to recalculate rendering points on the fly
  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setCanvasDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [activeSlideIndex,setActiveSlideIndex, currentSlide.content]);


const {
  isExporting,
  exportStoryPDF,
  makeStoryPreview,
} = useStoryExport({
  slides,
  storyName,
});

const {
  saveStory,
  publishStory,
  reloadSavedStory,
  normalizeStorySlides,

  
} = useStoryPersistence({
  storyId,
  storyName,
  slides,

  setStoryHistoryState,
  resetStoryHistory,

  createInitialStoryState,

  makeStoryPreview,

  isSlideActionRef,

  navigate,
});
const {
  addSlide,
  reorderSlides,
  duplicateSlide,
  deleteSlide,
} = useStorySlides({
  storyId,

  slides,
  setSlides,

  setActiveSlideIndex,
  setSelectedAnnoId,
  setSelectedChartId,

  saveStory,
  reloadSavedStory,
  normalizeStorySlides,
  activeSlideIndex,
  isSlideActionRef,
});
  const arrangeCharts = (items = []) => {
    const count = items.length;
    const gap = 1.5;

    if (count === 0) return [];

    if (count === 1) {
      return items.map((item, index) => ({
        ...item, x: 0, y: 0, width: 100, height: 100, zIndex: index + 1,
      }));
    }

    if (count === 2) {
      const width = (100 - gap) / 2;
      return items.map((item, index) => ({
        ...item,
        x: index * (width + gap),
        y: 0,
        width,
        height: 100,
        zIndex: index + 1,
      }));
    }

    if (count === 3) {
      const leftWidth = 58;
      const rightWidth = 100 - leftWidth - gap;
      const rightHeight = (100 - gap) / 2;

      return items.map((item, index) =>
        index === 0
          ? { ...item, x: 0, y: 0, width: leftWidth, height: 100, zIndex: 1 }
          : {
              ...item,
              x: leftWidth + gap,
              y: (index - 1) * (rightHeight + gap),
              width: rightWidth,
              height: rightHeight,
              zIndex: index + 1,
            }
      );
    }

    const columns =
      count === 4 ? 2 : count <= 6 ? 3 : Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);
    const width = (100 - gap * (columns - 1)) / columns;
    const height = (100 - gap * (rows - 1)) / rows;

    return items.map((item, index) => ({
      ...item,
      x: (index % columns) * (width + gap),
      y: Math.floor(index / columns) * (height + gap),
      width,
      height,
      zIndex: index + 1,
    }));
  };

const addChartToSlide = (
  chartId,
  name,
  imageUrl,
) => {
    let newItemId = null;

    setSlides((prev) =>
      prev.map((slide, index) => {
        if (index !== activeSlideIndex) return slide;

        const content = slide.content || [];
const newItem = createChartItem(
  chartId,
  name,
  imageUrl,
  content.length,
);        newItemId = newItem.id;

        return { ...slide, content: arrangeCharts([...content, newItem]) };
      })
    );

    setSelectedChartId(newItemId);
    setSelectedAnnoId(null);
    setShowPicker(false);
  };
const updateChartItem = (
  itemId,
  updates,
  options,
) => {
  setSlides(
    (previous) =>
      previous.map(
        (slide, index) =>
          index ===
          activeSlideIndex
            ? {
                ...slide,

                content: (
                  slide.content || []
                ).map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        ...updates,
                      }
                    : item,
                ),
              }
            : slide,
      ),
    options,
  );
};


  const deleteChartItem = (itemId) => {
    setSlides((prev) =>
      prev.map((slide, index) => {
        if (index !== activeSlideIndex) return slide;
        const remaining = (slide.content || []).filter(
          (item) => item.id !== itemId
        );
        return { ...slide, content: arrangeCharts(remaining) };
      })
    );

    setSelectedChartId((current) => (current === itemId ? null : current));
  };

  const duplicateChartItem = (itemId) => {
    let duplicatedId = null;

    setSlides((prev) =>
      prev.map((slide, index) => {
        if (index !== activeSlideIndex) return slide;

        const content = slide.content || [];
        const sourceItem = content.find((item) => item.id === itemId);
        if (!sourceItem) return slide;

        duplicatedId = `chart-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        const duplicate = {
          ...sourceItem,
          id: duplicatedId,
          name: `${sourceItem.name || "Chart"} copy`,
        };

        return { ...slide, content: arrangeCharts([...content, duplicate]) };
      })
    );

    setSelectedChartId(duplicatedId);
    setSelectedAnnoId(null);
  };
const bringChartToFront = (
  itemId,
  options,
) => {
  setSlides(
    (previous) =>
      previous.map(
        (slide, index) => {
          if (
            index !==
            activeSlideIndex
          ) {
            return slide;
          }

          const content =
            slide.content || [];

          const highest =
            Math.max(
              0,
              ...content.map(
                (item) =>
                  item.zIndex || 0,
              ),
            );

          return {
            ...slide,

            content:
              content.map(
                (item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        zIndex:
                          highest + 1,
                      }
                    : item,
              ),
          };
        },
      ),
    options,
  );
};

  const sendChartToBack = (itemId) => {
    setSlides((prev) =>
      prev.map((slide, index) => {
        if (index !== activeSlideIndex) return slide;
        const content = slide.content || [];
        const lowest = Math.min(0, ...content.map((item) => item.zIndex || 0));

        return {
          ...slide,
          content: content.map((item) =>
            item.id === itemId ? { ...item, zIndex: lowest - 1 } : item
          ),
        };
      })
    );
  };
const startChartInteraction = (
  event,
  mode,
  item,
) => {
  event.preventDefault();
  event.stopPropagation();

  if (!canvasRef.current) {
    return;
  }

  const startingStoryState =
    structuredClone(
      storyStateRef.current,
    );

  setSelectedChartId(item.id);
  setSelectedAnnoId(null);

  bringChartToFront(
    item.id,
    {
      record: false,
    },
  );

  chartInteractionRef.current = {
    mode,
    itemId: item.id,

    startClientX:
      event.clientX,

    startClientY:
      event.clientY,

    startX:
      item.x ?? 0,

    startY:
      item.y ?? 0,

    startWidth:
      item.width ?? 100,

    startHeight:
      item.height ?? 100,

    startingStoryState,
  };

  document.addEventListener(
    "mousemove",
    handleChartInteractionMove,
  );

  document.addEventListener(
    "mouseup",
    stopChartInteraction,
  );
};
const handleChartInteractionMove = (event) => {
  const interaction =
    chartInteractionRef.current;

  const canvas =
    canvasRef.current;

  if (!interaction || !canvas) {
    return;
  }

  const rect =
    canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return;
  }

  const deltaX =
    ((event.clientX -
      interaction.startClientX) /
      rect.width) *
    100;

  const deltaY =
    ((event.clientY -
      interaction.startClientY) /
      rect.height) *
    100;

  if (
    interaction.mode === "move"
  ) {
    updateChartItem(
      interaction.itemId,
      {
        x: Math.max(
          0,
          Math.min(
            100 -
              interaction.startWidth,

            interaction.startX +
              deltaX,
          ),
        ),

        y: Math.max(
          0,
          Math.min(
            100 -
              interaction.startHeight,

            interaction.startY +
              deltaY,
          ),
        ),
      },
      {
        record: false,
      },
    );

    return;
  }

  const minWidth = 18;
  const minHeight = 18;

  let x = interaction.startX;
  let y = interaction.startY;
  let width =
    interaction.startWidth;
  let height =
    interaction.startHeight;

  if (
    interaction.mode.includes(
      "right",
    )
  ) {
    width = Math.max(
      minWidth,
      Math.min(
        100 -
          interaction.startX,

        interaction.startWidth +
          deltaX,
      ),
    );
  }

  if (
    interaction.mode.includes(
      "bottom",
    )
  ) {
    height = Math.max(
      minHeight,
      Math.min(
        100 -
          interaction.startY,

        interaction.startHeight +
          deltaY,
      ),
    );
  }

  if (
    interaction.mode.includes(
      "left",
    )
  ) {
    const nextX = Math.max(
      0,
      Math.min(
        interaction.startX +
          interaction.startWidth -
          minWidth,

        interaction.startX +
          deltaX,
      ),
    );

    x = nextX;

    width =
      interaction.startWidth +
      interaction.startX -
      nextX;
  }

  if (
    interaction.mode.includes(
      "top",
    )
  ) {
    const nextY = Math.max(
      0,
      Math.min(
        interaction.startY +
          interaction.startHeight -
          minHeight,

        interaction.startY +
          deltaY,
      ),
    );

    y = nextY;

    height =
      interaction.startHeight +
      interaction.startY -
      nextY;
  }

  updateChartItem(
    interaction.itemId,
    {
      x,
      y,
      width,
      height,
    },
    {
      record: false,
    },
  );
};

const stopChartInteraction = () => {
  const interaction =
    chartInteractionRef.current;

  if (
    interaction
      ?.startingStoryState
  ) {
    commitStoryHistory(
      interaction
        .startingStoryState,

      storyStateRef.current,
    );
  }

  chartInteractionRef.current =
    null;

  document.removeEventListener(
    "mousemove",
    handleChartInteractionMove,
  );

  document.removeEventListener(
    "mouseup",
    stopChartInteraction,
  );
};

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const data = await apiRequest(
          "/projects/all",
        );

        setAvailableProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchCharts();
  }, []);

const handleProjectClick = async (projectId) => {
  try {
    const chart = await apiRequest(
      `/projects/chart/${projectId}`,
    );


    if (!chart || !chart.id) {
      console.error("No chart id found:", chart);
      return;
    }

addChartToSlide(
  chart.id,
  chart.name ||
    chart.settings?.title ||
    "Untitled chart",
  chart.image_data ||
    chart.image_url ||
    null,
);

setShowPicker(false);
  } catch (err) {
    console.error("Failed to load charts", err);
  }
};

  const addAnnotation = () => {
    const newId = `anno-${Date.now()}`;
    const count = (currentSlide.annotations || []).length + 1;
    const newAnno = {
      id: newId,
      text: `Annotation point #${count}`,
      markerType: "dot",
      connectorType: "curved",
      x: 50,
      y: 40, 
      textX: 55,
      textY: 55,
      width: 15,
      height: 15,
      fillColor: "#3b82f6",
      radius: 6,
      labelWidth: 12,
      textSize: 0.85,
      textColor: "#1e293b",
      textBg: "white",
      fontWeight: "normal",
      textAlign: "left",
      lineWidth: 1.5,
      lineColor: "#64748b",
    };

    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, annotations: [...(s.annotations || []), newAnno]
    } : s));
    setSelectedAnnoId(newId);
  };

  const updateAnnotation = (id, key, value) => {
    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, annotations: (s.annotations || []).map(a => a.id === id ? { ...a, [key]: value } : a)
    } : s));
  };

  const removeAnnotation = (id) => {
    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, annotations: (s.annotations || []).filter(a => a.id !== id)
    } : s));
    if (selectedAnnoId === id) setSelectedAnnoId(null);
  };

  const handleDragMove = (event) => {
  if (
    !canvasRef.current ||
    !dragContext.current?.annoId
  ) {
    return;
  }

  const rect =
    canvasRef.current.getBoundingClientRect();

  const context =
    dragContext.current;
    
  context.hasMoved = true;
const deltaX =
  ((event.clientX -
    context.startX) /
    rect.width) *
  100;

const deltaY =
  ((event.clientY -
    context.startY) /
    rect.height) *
  100;
  setSlidesDuringDrag(
  (previousSlides) =>
    previousSlides.map(
      (slide, index) => {
        if (
          index !== activeSlideIndex
        ) {
          return slide;
        }

        return {
          ...slide,

          annotations: (
            slide.annotations || []
          ).map((annotation) => {
            if (
              annotation.id !==
              context.annoId
            ) {
              return annotation;
            }

            if (
              context.type ===
              "target"
            ) {
              return {
                ...annotation,

                x: Math.max(
                  0,
                  Math.min(
                    100,
                    context.startAnnoX +
                      deltaX ,
                  ),
                ),

                y: Math.max(
                  0,
                  Math.min(
                    100,
                    context.startAnnoY +
                      deltaY,
                  ),
                ),
              };
            }

            if (
  context.type ===
  "label"
) {
  return {
    ...annotation,

    textX: Math.max(
      0,
      Math.min(
        100,
        context.startTextX +
          deltaX ,
      ),
    ),

    textY: Math.max(
      0,
      Math.min(
        100,
        context.startTextY +
          deltaY,
      ),
    ),
  };
}

            if (
              context.type ===
              "resize"
            ) {
              const deltaPercentageX =
                ((event.clientX -
                  context.startX) /
                  rect.width) *
                100;

              const deltaPercentageY =
                ((event.clientY -
                  context.startY) /
                  rect.height) *
                100;

              if (
                annotation.markerType ===
                "circle"
              ) {
                const uniformDelta =
                  (deltaPercentageX +
                    deltaPercentageY) /
                  2;

                const newSize =
                  Math.max(
                    3,
                    context.startWidth +
                      uniformDelta,
                  );

                return {
                  ...annotation,
                  width: newSize,
                  height: newSize,
                };
              }

              return {
                ...annotation,

                width: Math.max(
                  3,
                  context.startWidth +
                    deltaPercentageX,
                ),

                height: Math.max(
                  3,
                  context.startHeight +
                    deltaPercentageY,
                ),
              };
            }

            return annotation;
          }),
        };
      },
    ),
  );
};



const handleDragStart = (
  event,
  type,
  annoId,
  currentAnno = null,
) => {
  event.preventDefault();
  event.stopPropagation();

  setSelectedAnnoId(annoId);
  setSelectedChartId(null);

dragContext.current = {
  type,
  annoId,

  startX: event.clientX,
  startY: event.clientY,

  startAnnoX:
    currentAnno?.x ?? 0,

  startAnnoY:
    currentAnno?.y ?? 0,

  startTextX:
    currentAnno?.textX ?? 0,

  startTextY:
    currentAnno?.textY ?? 0,

  startWidth:
    currentAnno?.width ?? 15,

  startHeight:
    currentAnno?.height ?? 15,


    startingStoryState:
      structuredClone(
        storyStateRef.current,
      ),

    latestStoryState:
      structuredClone(
        storyStateRef.current,
      ),

    hasMoved: false,
  };

  document.addEventListener(
    "mousemove",
    handleDragMove,
  );

  document.addEventListener(
    "mouseup",
    handleDragEnd,
  );
};



const handleDragEnd = () => {
  const context =
    dragContext.current;

  document.removeEventListener(
    "mousemove",
    handleDragMove,
  );

  document.removeEventListener(
    "mouseup",
    handleDragEnd,
  );

  if (
    context?.hasMoved &&
    context?.startingStoryState &&
    context?.latestStoryState
  ) {
    commitStoryHistory(
      context.startingStoryState,
      context.latestStoryState,
    );

  }

  dragContext.current = {
    type: null,
    annoId: null,
    startingStoryState: null,
    latestStoryState: null,
    hasMoved: false,
  };
};

useEffect(() => {
  return () => {
    document.removeEventListener(
      "mousemove",
      handleChartInteractionMove,
    );

    document.removeEventListener(
      "mouseup",
      stopChartInteraction,
    );

    document.removeEventListener(
      "mousemove",
      handleDragMove,
    );

    document.removeEventListener(
      "mouseup",
      handleDragEnd,
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);


  useEffect(() => {
  const handleHistoryShortcut = (
    event,
  ) => {
    const target = event.target;

    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    /*
     * Keep native text-field Undo working
     * while the user types.
     */
    if (isTyping) {
      return;
    }

    const modifier =
      event.ctrlKey ||
      event.metaKey;

    if (!modifier) {
      return;
    }

    const key =
      event.key.toLowerCase();

    if (
      key === "z" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      undoStory();
      return;
    }

    if (
      (key === "z" &&
        event.shiftKey) ||
      key === "y"
    ) {
      event.preventDefault();
      redoStory();
    }
  };

  window.addEventListener(
    "keydown",
    handleHistoryShortcut,
  );

  return () => {
    window.removeEventListener(
      "keydown",
      handleHistoryShortcut,
    );
  };
}, [undoStory, redoStory]);


  return (
    <>
      <Header />

      <div className="app-page flex h-screen flex-col font-sans select-none">
        <StoryTopToolbar
          navigate={navigate}
          storyName={storyName}
          storyNameBeforeEditRef={storyNameBeforeEditRef}
          setStoryName={setStoryName}
          commitStoryHistory={commitStoryHistory}
          storyHistoryState={storyHistoryState}
          undoStory={undoStory}
          canUndoStory={canUndoStory}
          redoStory={redoStory}
          canRedoStory={canRedoStory}
          exportStoryPDF={exportStoryPDF}
          publishStory={publishStory}
          saveStory={saveStory}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <StorySlidesSidebar
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            setActiveSlideIndex={setActiveSlideIndex}
            setSelectedAnnoId={setSelectedAnnoId}
            setSelectedChartId={setSelectedChartId}
            duplicateSlide={duplicateSlide}
            deleteSlide={deleteSlide}
            addSlide={addSlide}
            reorderSlides={reorderSlides}
          />

          <StoryMainCanvas
            activeSlideIndex={activeSlideIndex}
            currentSlide={currentSlide}
            setSlides={setSlides}
            slides={slides}
            canvasRef={canvasRef}
            selectedChartId={selectedChartId}
            selectedAnnoId={selectedAnnoId}
            setSelectedChartId={setSelectedChartId}
            setSelectedAnnoId={setSelectedAnnoId}
            startChartInteraction={startChartInteraction}
            duplicateChartItem={duplicateChartItem}
            deleteChartItem={deleteChartItem}
            sendChartToBack={sendChartToBack}
            setShowPicker={setShowPicker}
            canvasDimensions={canvasDimensions}
            handleDragStart={handleDragStart}
            setActiveSlideIndex={setActiveSlideIndex}
          />

          <StoryAnnotationsSidebar
            currentSlide={currentSlide}
            addAnnotation={addAnnotation}
            selectedAnnoId={selectedAnnoId}
            setSelectedAnnoId={setSelectedAnnoId}
            removeAnnotation={removeAnnotation}
            updateAnnotation={updateAnnotation}
          />
        </div>
      </div>

      <StoryExportSlides
        isExporting={isExporting}
        slides={slides}
        SLIDE_WIDTH={SLIDE_WIDTH}
        SLIDE_HEIGHT={SLIDE_HEIGHT}
      />

      <StoryProjectPickerModal
        showPicker={showPicker}
        setShowPicker={setShowPicker}
        search={search}
        setSearch={setSearch}
        availableProjects={availableProjects}
        handleProjectClick={handleProjectClick}
      />
    </>
  );
}

export default NewStory;
