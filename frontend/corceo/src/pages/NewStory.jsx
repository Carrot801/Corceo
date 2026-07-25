import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoryChart from "../components/StoryChart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Header from "../components/Header";
import useHistoryState from "../hooks/useHistoryState";

function SlideThumbnail({
  slide,
  slideNumber,
}) {
  return (
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-white
      "
    >
      {/* Slide title */}
      {slide.description && (
        <div
          className="
            absolute
            left-[4%]
            right-[4%]
            top-[4%]
            z-40
            truncate
            text-[7px]
            font-bold
            text-slate-800
          "
        >
          {slide.description}
        </div>
      )}

      {/* Chart image layout */}
      <div
        className="
          absolute
          bottom-[4%]
          left-[4%]
          right-[4%]
          top-[18%]
          overflow-hidden
          rounded-sm
          bg-slate-50
        "
      >
        {(slide.content || []).map(
          (item, index) => (
            <div
              key={item.id || `${item.chartId}-${index}`}
              className="
                absolute
                overflow-hidden
                bg-white
              "
              style={{
                left: `${item.x ?? 0}%`,
                top: `${item.y ?? 0}%`,
                width: `${item.width ?? 100}%`,
                height: `${item.height ?? 100}%`,
                zIndex: item.zIndex ?? index + 1,
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                  draggable={false}
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    bg-slate-100
                    text-[8px]
                    text-slate-400
                  "
                >
                  Chart
                </div>
              )}
            </div>
          ),
        )}

        {/* Basic annotation connectors */}
        <svg
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            h-full
            w-full
          "
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {(slide.annotations || []).map(
            (annotation) => {
              if (
                annotation.connectorType === "none"
              ) {
                return null;
              }

              const x1 =
                annotation.textX ?? 55;
              const y1 =
                annotation.textY ?? 55;
              const x2 =
                annotation.x ?? 50;
              const y2 =
                annotation.y ?? 40;

              return (
                <line
                  key={`line-${annotation.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    annotation.lineColor ||
                    "#64748b"
                  }
                  strokeWidth="0.5"
                />
              );
            },
          )}
        </svg>

        {/* Annotation markers and labels */}
        {(slide.annotations || []).map(
          (annotation) => (
            <React.Fragment
              key={annotation.id}
            >
              {annotation.markerType ===
                "dot" && (
                <div
                  className="
                    absolute
                    z-30
                    rounded-full
                    border
                    border-white
                  "
                  style={{
                    left: `${
                      annotation.x ?? 50
                    }%`,
                    top: `${
                      annotation.y ?? 40
                    }%`,

                    width: "5px",
                    height: "5px",

                    transform:
                      "translate(-50%, -50%)",

                    backgroundColor:
                      annotation.fillColor ||
                      "#3b82f6",
                  }}
                />
              )}

              {annotation.markerType ===
                "circle" && (
                <div
                  className="
                    absolute
                    z-30
                    rounded-full
                    border
                  "
                  style={{
                    left: `${
                      annotation.x ?? 50
                    }%`,
                    top: `${
                      annotation.y ?? 40
                    }%`,

                    width: `${
                      annotation.width ?? 15
                    }%`,

                    aspectRatio: "1 / 1",

                    borderColor:
                      annotation.fillColor ||
                      "#3b82f6",
                  }}
                />
              )}

              {annotation.markerType ===
                "square" && (
                <div
                  className="
                    absolute
                    z-30
                    rounded-sm
                    border
                  "
                  style={{
                    left: `${
                      annotation.x ?? 50
                    }%`,
                    top: `${
                      annotation.y ?? 40
                    }%`,

                    width: `${
                      annotation.width ?? 15
                    }%`,

                    height: `${
                      annotation.height ?? 15
                    }%`,

                    borderColor:
                      annotation.fillColor ||
                      "#3b82f6",
                  }}
                />
              )}

              <div
                className="
                  absolute
                  z-40
                  max-w-[45%]
                  truncate
                  rounded-sm
                  px-1
                  py-0.5
                  text-[5px]
                  leading-tight
                "
                style={{
                  left: `${
                    annotation.textX ?? 55
                  }%`,

                  top: `${
                    annotation.textY ?? 55
                  }%`,

                  transform:
                    "translate(-50%, -50%)",

                  color:
                    annotation.textColor ||
                    "#1e293b",

                  backgroundColor:
                    annotation.textBg ===
                    "transparent"
                      ? "transparent"
                      : annotation.textBg ||
                        "#ffffff",
                }}
              >
                {annotation.text ||
                  "Annotation"}
              </div>
            </React.Fragment>
          ),
        )}
      </div>

      {(slide.content || []).length === 0 && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            text-[9px]
            text-slate-400
          "
        >
          Slide {slideNumber}
        </div>
      )}
    </div>
  );
}


function NewStory() {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const isSlideActionRef = useRef(false);

  const createInitialStoryState = () => ({
  storyName: "Untitled Story",

  slides: [
    {
      id: `temp-${crypto.randomUUID()}`,
      content: [],
      description: "",
      annotations: [],
    },
  ],
});
  useEffect(() => {
    console.log("URL Param storyId is:", storyId);
  }, [storyId]);
  const [isExporting, setIsExporting] =
    useState(false);
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

  const hasLoadedStoryRef = useRef(false);
  const autosaveTimerRef = useRef(null);


  const storyStateRef =
  useRef(storyHistoryState);

  const storyNameBeforeEditRef =
  useRef(storyName);

useEffect(() => {
  storyStateRef.current =
    storyHistoryState;
}, [storyHistoryState]);
const exportStoryPDF = async () => {
  try {
    setIsExporting(true);

    let slideElements = [];

    for (
      let attempt = 0;
      attempt < 30;
      attempt++
    ) {
      slideElements = Array.from(
        document.querySelectorAll(
          ".export-slide",
        ),
      );

      if (
        slideElements.length ===
        slides.length
      ) {
        break;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }

    if (!slideElements.length) {
      throw new Error(
        "Export slides were not rendered",
      );
    }

    const images =
      slideElements.flatMap((slide) =>
        Array.from(
          slide.querySelectorAll("img"),
        ),
      );

    await Promise.all(
      images.map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.onload = resolve;
            image.onerror = resolve;
          }),
      ),
    );

    const pdf = new jsPDF(
      "landscape",
      "pt",
      [1280, 720],
    );

    for (
      let index = 0;
      index < slideElements.length;
      index++
    ) {
      const canvas =
        await html2canvas(
          slideElements[index],
          {
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            backgroundColor:
              "#ffffff",
            logging: false,
          },
        );

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.9,
        );

      if (index > 0) {
        pdf.addPage(
          [1280, 720],
          "landscape",
        );
      }

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        1280,
        720,
      );
    }

    pdf.save(
      `${storyName || "story"}.pdf`,
    );
  } catch (error) {
    console.error(
      "PDF export failed:",
      error,
    );
  } finally {
    setIsExporting(false);
  }
};
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
  }, [activeSlideIndex, currentSlide.content]);


 const waitForExportSlide = async (
  attempts = 20,
) => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const exportSlide =
      document.querySelector(
        ".export-slide",
      );

    if (exportSlide) {
      return exportSlide;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  return null;
};

const makeStoryPreview = async () => {
  try {
    /*
     * Temporarily mount the hidden export slide.
     */
    setIsExporting(true);

    /*
     * Wait for React to render the export slide.
     */
    const firstSlide =
      await waitForExportSlide();

    if (!firstSlide) {
      throw new Error(
        "First export slide was not rendered",
      );
    }

    /*
     * Wait for images inside the slide.
     */
    const images = Array.from(
      firstSlide.querySelectorAll("img"),
    );

    await Promise.all(
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          image.onload = resolve;
          image.onerror = resolve;
        });
      }),
    );

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    const canvas = await html2canvas(
      firstSlide,
      {
        scale: 0.7,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      },
    );

    return canvas.toDataURL(
      "image/jpeg",
      0.8,
    );
  } catch (error) {
    console.error(
      "Story preview generation failed:",
      error,
    );

    return null;
  } finally {
    setIsExporting(false);
  }
};


  const addSlide = () => {
    const newSlide = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content: [],
      description: "",
      annotations: [],
    };

    setSlides((prev) => {
      const updated = [...prev, newSlide];
      setActiveSlideIndex(updated.length - 1);
      return updated;
    });

    setSelectedAnnoId(null);
    setSelectedChartId(null);
  };


    const duplicateSlide = async (index) => {
  const sourceSlide = slides[index];

  if (!sourceSlide) {
    console.error(
      "Cannot duplicate: slide does not exist",
      index,
    );
    return;
  }

  try {
    /*
     * First save the story.
     *
     * This guarantees that every slide has a current
     * database ID before duplication begins.
     */
    const actualStoryId = await saveStory();

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "No authentication token found",
      );
    }

    /*
     * saveStory reloads the story and React state updates
     * asynchronously. Therefore, obtain the canonical slide
     * again directly from the server.
     */
    const storyResponse = await fetch(
      `http://localhost:5000/stories/${actualStoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const storyData = await storyResponse.json();

    if (!storyResponse.ok) {
      throw new Error(
        storyData.error ||
          "Failed to load saved slides",
      );
    }

    const canonicalSlides =
      normalizeStorySlides(storyData);

    const canonicalSourceSlide =
      canonicalSlides[index];

    if (!canonicalSourceSlide?.id) {
      throw new Error(
        "The saved slide has no database ID",
      );
    }

    isSlideActionRef.current = true;

    const response = await fetch(
      `http://localhost:5000/stories/${actualStoryId}/slides/${canonicalSourceSlide.id}/duplicate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Failed to duplicate slide",
      );
    }

    /*
     * Reload the entire story after duplication.
     * This keeps positions and all database IDs canonical.
     */
    const updatedStory = await reloadSavedStory(
      actualStoryId,
      token,
    );

    const duplicatedIndex = Math.min(
      index + 1,
      (updatedStory.slides || []).length - 1,
    );

    setActiveSlideIndex(duplicatedIndex);
    setSelectedAnnoId(null);
    setSelectedChartId(null);
  } catch (error) {
    console.error(
      "Duplicate slide error:",
      error,
    );
  } finally {
    setTimeout(() => {
      isSlideActionRef.current = false;
    }, 300);
  }
};


const deleteSlide = async (index) => {
  const targetSlide = slides[index];

  if (!targetSlide) return;

  const slideId = targetSlide.id;

  const removeSlideLocally = () => {
    setSlides((prev) => {
      const updated = prev.filter(
        (slide) =>
          String(slide.id) !== String(slideId)
      );

      return updated.length
        ? updated
        : [
            {
              id: `temp-${Date.now()}-${crypto.randomUUID()}`,
              content: [],
              description: "",
              annotations: [],
            },
          ];
    });

    setActiveSlideIndex((current) => {
      const nextLength = Math.max(slides.length - 1, 1);

      if (current > index) {
        return current - 1;
      }

      if (current === index) {
        return Math.min(index, nextLength - 1);
      }

      return current;
    });

    setSelectedAnnoId(null);
    setSelectedChartId(null);
  };

  if (String(slideId).startsWith("temp-")) {
    removeSlideLocally();
    return;
  }

  try {
    isSlideActionRef.current = true;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/stories/${storyId}/slides/${slideId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let data = {};

    try {
      data = await res.json();
    } catch {
      // DELETE endpoints may return an empty response.
    }

    if (!res.ok) {
      throw new Error(
        data.error || "Failed to delete slide"
      );
    }

    removeSlideLocally();
  } catch (err) {
    console.error("Delete slide error:", err);
  } finally {
    setTimeout(() => {
      isSlideActionRef.current = false;
    }, 500);
  }
};

const createChartItem = (
  chartId,
  name,
  imageUrl,
  index = 0,
) => ({
  id: `chart-${crypto.randomUUID()}`,
  type: "chart",
  chartId,
  name,
  imageUrl: imageUrl || null,

  x: 0,
  y: 0,
  width: 100,
  height: 100,
  zIndex: index + 1,
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
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/projects/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAvailableProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchCharts();
  }, []);

const handleProjectClick = async (projectId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/projects/chart/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const chart = await res.json();

    console.log("chart response:", chart);

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!storyId || storyId === "new" || storyId === "undefined") return;

    fetch(`http://localhost:5000/stories/${storyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        hasLoadedStoryRef.current = true;

        resetStoryHistory({
          storyName:
            data.name ||
            "Untitled Story",

          slides:
            data.slides?.length
              ? normalizeStorySlides(data)
              : createInitialStoryState()
                  .slides,
        });
      })
      .catch(err => console.error("Fetch error:", err));
  }, [storyId,resetStoryHistory]);

  useEffect(() => {
  if (!hasLoadedStoryRef.current) return;
  if (storyId === "new" || !storyId) return;
  if (isSlideActionRef.current) return;

  clearTimeout(autosaveTimerRef.current);

  autosaveTimerRef.current = setTimeout(() => {
    saveStory();
  }, 1200);

  return () => clearTimeout(autosaveTimerRef.current);
}, [storyName, slides]);
const cleanSlides = slides.map((slide) => {
  const isTemp = String(slide.id).startsWith("temp-");

  return {
    ...slide,
    id: isTemp ? undefined : slide.id,

    content: (slide.content || []).map((item, index) => ({
      id: item.id,
      type: item.type || "chart",
      chartId: item.chartId,
      name: item.name || "Chart",

      imageUrl: item.imageUrl || null,

      x: Number(item.x ?? 0),
      y: Number(item.y ?? 0),
      width: Number(item.width ?? 100),
      height: Number(item.height ?? 100),
      zIndex: Number(item.zIndex ?? index + 1),
    })),

    annotations: slide.annotations || [],
  };
});

const normalizeStorySlides = (storyData) => {
  return (storyData.slides || []).map((slide) => ({
    ...slide,

    id: slide.id,

    description: slide.description || "",

    annotations: slide.annotations || [],

    content: (slide.content || []).map((item, index) => ({
      ...item,

      /*
       * Keep a stable UI ID for chart interactions.
       * The backend currently returns chart items using a generated ID.
       */
      id:
        item.id ||
        `chart-instance-${slide.id}-${item.chartId}-${index}`,

        chartId:
          item.chartId ??
          item.chart_id,

imageUrl:
  item.imageUrl ??
  item.image_data ??
  item.chart_image_data ??
  item.image_url ??
  item.chart_image_url ??
  null,

        name: item.name || "Chart",
        type: item.type || "chart",

      x: Number(item.x ?? 0),
      y: Number(item.y ?? 0),
      width: Number(item.width ?? 100),
      height: Number(item.height ?? 100),
      zIndex: Number(
        item.zIndex ??
        item.z_index ??
        index + 1,
      ),
    })),
  }));
};

const reloadSavedStory = async (
  savedStoryId,
  token,
) => {
  const response = await fetch(
    `http://localhost:5000/stories/${savedStoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const storyData = await response.json();

  if (!response.ok) {
    throw new Error(
      storyData.error ||
        "Failed to reload the saved story",
    );
  }

setStoryHistoryState(
  (current) => ({
    ...current,

    storyName:
      storyData.name ||
      current.storyName,

    slides:
      normalizeStorySlides(
        storyData,
      ),
  }),
  {
    record: false,
  },
);

  return storyData;
};

const saveStory = async () => {
  const isNew =
    storyId === "new" ||
    !storyId ||
    storyId === "undefined";

  const url = isNew
    ? "http://localhost:5000/stories"
    : `http://localhost:5000/stories/${storyId}`;

  try {
    /*
     * Prevent autosave from running again while canonical
     * slide IDs are being loaded into React state.
     */
    isSlideActionRef.current = true;

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

const image_url =
  await makeStoryPreview();

console.log(
  "Story preview before save:",
  {
    exists: Boolean(image_url),
    length: image_url?.length || 0,
    start:
      image_url?.slice(0, 30) ||
      null,
  },
);

const response = await fetch(url, {
      method: isNew ? "POST" : "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name: storyName,
        slides: cleanSlides,
        image_url,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Failed to save story",
      );
    }

    const actualStoryId = isNew
      ? result.id
      : storyId;

    if (!actualStoryId) {
      throw new Error(
        "The backend did not return a story ID",
      );
    }

    /*
     * Important:
     * updateStory deletes and recreates all slides,
     * so immediately reload their new database IDs.
     */
    await reloadSavedStory(actualStoryId, token);

    hasLoadedStoryRef.current = true;

    if (isNew) {
      navigate(`/stories/${actualStoryId}`, {
        replace: true,
      });
    }

    return actualStoryId;
  } catch (error) {
    console.error("Save error:", error);
    throw error;
  } finally {
    /*
     * Keep autosave paused until the React state update
     * produced by reloadSavedStory has finished.
     */
    setTimeout(() => {
      isSlideActionRef.current = false;
    }, 300);
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
  let percentageX =
    ((event.clientX - rect.left) /
      rect.width) *
    100;

  let percentageY =
    ((event.clientY - rect.top) /
      rect.height) *
    100;

  percentageX = Math.max(
    0,
    Math.min(100, percentageX),
  );

  percentageY = Math.max(
    0,
    Math.min(100, percentageY),
  );

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
                x: percentageX,
                y: percentageY,
              };
            }

            if (
              context.type ===
              "label"
            ) {
              return {
                ...annotation,
                textX: percentageX,
                textY: percentageY,
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
}, []);

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

const publishStory = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "No authentication token found",
      );
    }

    const actualStoryId = await saveStory();

    if (!actualStoryId) {
      throw new Error(
        "The story could not be saved before publishing",
      );
    }

    const publishRes = await fetch(
      `http://localhost:5000/stories/${actualStoryId}/publish`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const published =
      await publishRes.json();

    if (!publishRes.ok) {
      throw new Error(
        published.error ||
          "Failed to publish story",
      );
    }

    navigate(
      `/publishedStory/${actualStoryId}`,
    );
  } catch (error) {
    console.error(
      "Publish story error:",
      error,
    );
  }
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
    /*
     * The annotation is already visually located
     * at latestStoryState because mousemove updated it.
     *
     * Do not set the state again here.
     * Only register the complete drag in history.
     */
    commitStoryHistory(
      context.startingStoryState,
      context.latestStoryState,
    );

    storyStateRef.current =
      context.latestStoryState;
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

  // Convert responsive percentages back into strict uniform pixel targets
  // Convert responsive percentages into strict uniform pixel targets anchored to shape borders
  const renderConnectorPath = (anno) => {
    if (anno.connectorType === "none" || !canvasDimensions.width) return null;

    const x1 = (anno.textX / 100) * canvasDimensions.width;
    const y1 = (anno.textY / 100) * canvasDimensions.height;
    
    // Change these to 'let' so we can recalculate their boundary positions dynamically
    let x2 = (anno.x / 100) * canvasDimensions.width;
    let y2 = (anno.y / 100) * canvasDimensions.height;

    // DYNAMIC BORDER ANCHORING ENGINE
    if (anno.markerType === "square" || anno.markerType === "circle") {
      const boxW = ((anno.width || 15) / 100) * canvasDimensions.width;
      // If it's a circle, its pixel height matches its pixel width due to aspect-ratio rules
      const boxH = anno.markerType === "circle" ? boxW : ((anno.height || 15) / 100) * canvasDimensions.height;
      
      // 1. Pinpoint the exact center coordinates of the shape framework
      const shapeCenterX = x2 + boxW / 2;
      const shapeCenterY = y2 + boxH / 2;
      
      // 2. Formulate direction vectors from the floating text label to the shape center
      const dx = shapeCenterX - x1;
      const dy = shapeCenterY - y1;
      const distance = Math.hypot(dx, dy) || 1;
      
      // 3. Compute precise border intersection padding offset based on approach angle
      let edgeOffset = boxW / 2; 
      
      if (anno.markerType === "square") {
        const absCos = Math.abs(dx / distance);
        const absSin = Math.abs(dy / distance);
        // Angular slope check determines if arrow hits the left/right or top/bottom walls
        if (boxW * absSin <= boxH * absCos) {
          edgeOffset = (boxW / 2) / (absCos || 1);
        } else {
          edgeOffset = (boxH / 2) / (absSin || 1);
        }
      }
      
      // 4. Override line destination to snap flush against the outer wall perimeter
      x2 = shapeCenterX - (dx / distance) * edgeOffset;
      y2 = shapeCenterY - (dy / distance) * edgeOffset;
    }
    else if (anno.markerType === "dot") {
      // Calculate the dot's real pixel radius based on your rendering layout
      const radiusPx = (anno.radius || 6) * 1.25;
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.hypot(dx, dy) || 1;
      
      // Pull the arrow destination back to the outer rim of the dot (plus 3px breathing room)
      x2 = x2 - (dx / distance) * (radiusPx + 3);
      y2 = y2 - (dy / distance) * (radiusPx + 3);
    }

    const strokeColor = anno.lineColor || "#64748b";
    const strokeW = anno.lineWidth || 1.5;

    if (anno.connectorType === "straight") {
      return (
        <line 
          key={`line-${anno.id}`}
          x1={x1} 
          y1={y1} 
          x2={x2} 
          y2={y2} 
          stroke={strokeColor} 
          strokeWidth={strokeW} 
          markerEnd={`url(#arrow-${anno.id})`} 
        />
      );
    }
    
    if (anno.connectorType === "curved") {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const h = Math.hypot(dx, dy);
      
      const bendFactor = 0.2; 
      const cx = (x1 + x2) / 2 - (dy / h) * (h * bendFactor);
      const cy = (y1 + y2) / 2 + (dx / h) * (h * bendFactor);

      return (
        <path 
          key={`angle-${anno.id}`}
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} 
          fill="none" stroke={strokeColor} strokeWidth={strokeW} 
          markerEnd={`url(#arrow-${anno.id})`} 
        />
      );
    }
    
    if (anno.connectorType === "angled") {
      return (
        <path 
          d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`} 
          fill="none" stroke={strokeColor} strokeWidth={strokeW} 
          markerEnd={`url(#arrow-${anno.id})`} 
        />
      );
    }
    return null;
  };
  

  return (
    <>
    <Header/>
    <div className="app-page flex h-screen flex-col font-sans select-none">
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

    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* LEFT SIDEBAR: Slide Deck */}
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
                className="group flex w-full shrink-0 gap-2"
              >
                {/* Slide number */}
                <div className="app-text-muted flex w-5 shrink-0 items-start justify-center pt-3 text-[11px] font-semibold">
                  {index + 1}
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

      {/* CENTRAL MAIN CANVAS */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden">
        <div className="story-slide app-card w-full max-w-4xl shadow-xl h-[620px] rounded-2xl p-6 flex flex-col gap-4 relative">          
          <input
            type="text"
            placeholder="Enter slide title or description narrative..."
            value={currentSlide.description || ""}
            onChange={(e) => {
              const updatedSlides = [...slides];
              updatedSlides[activeSlideIndex].description = e.target.value;
              setSlides(updatedSlides);
            }}
            className="app-text bg-transparent w-full text-2xl font-bold border-b border-transparent hover:border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-highlight))] outline-none pb-2 transition-colors"
          />

          {/* Core Interactive Bounding Canvas Wrapper */}
          <div 
            ref={canvasRef}
            className="app-surface-secondary app-border flex-1 border rounded-xl relative group"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedAnnoId(null);
                setSelectedChartId(null);
              }
            }}
          >
            {/* Chart Renderer Layer */}
            <div className="absolute inset-0 z-[5] overflow-hidden rounded-xl">
              {(currentSlide.content || []).map((item) => {
                const isSelected = selectedChartId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`absolute group rounded-xl transition-shadow ${
                      isSelected
                        ? "ring-2 ring-[rgb(var(--color-primary))] shadow-xl"
                        : "hover:ring-1 hover:ring-[rgb(var(--color-border-strong))]"
                    }`}
                    style={{
                      left: `${item.x ?? 5}%`,
                      top: `${item.y ?? 5}%`,
                      width: `${item.width ?? 48}%`,
                      height: `${item.height ?? 45}%`,
                      zIndex: item.zIndex ?? 1,
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      setSelectedChartId(item.id);
                      setSelectedAnnoId(null);
                    }}
                  >
                    <div className="app-card relative h-full w-full overflow-hidden rounded-sm">
                      <div
                        className={`absolute left-0 right-0 top-0 z-20 flex h-9 items-center justify-between border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/90 px-2 backdrop-blur-sm transition-opacity ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <button
                          type="button"
                          className="app-text-secondary min-w-0 flex-1 cursor-move truncate text-left text-[11px] font-semibold"
                          title="Drag chart"
                          onMouseDown={(event) =>
                            startChartInteraction(event, "move", item)
                          }
                        >
                          ⋮⋮ {item.name || "Chart"}
                        </button>

                        <div className="ml-2 flex shrink-0 gap-1">
                          <button
                            type="button"
                            title="Send backward"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              sendChartToBack(item.id);
                            }}
                            className="app-icon-button h-6 w-6 rounded text-xs"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            title="Duplicate chart"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              duplicateChartItem(item.id);
                            }}
                            className="app-icon-button h-6 w-6 rounded text-xs"
                          >
                            ⧉
                          </button>

                          <button
                            type="button"
                            title="Delete chart"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteChartItem(item.id);
                            }}
                            className="app-icon-button h-6 w-6 rounded text-xs text-[rgb(var(--color-danger))]"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="h-full w-full">
                        <StoryChart chartId={item.chartId} />
                      </div>

                      {isSelected && (
                        <>
                          <div
                            onMouseDown={(event) =>
                              startChartInteraction(event, "top", item)
                            }
                            className="absolute left-3 right-3 top-0 z-30 h-2 -translate-y-1/2 cursor-n-resize"
                          />
                          <div
                            onMouseDown={(event) =>
                              startChartInteraction(event, "bottom", item)
                            }
                            className="absolute bottom-0 left-3 right-3 z-30 h-2 translate-y-1/2 cursor-s-resize"
                          />
                          <div
                            onMouseDown={(event) =>
                              startChartInteraction(event, "left", item)
                            }
                            className="absolute bottom-3 left-0 top-3 z-30 w-2 -translate-x-1/2 cursor-w-resize"
                          />
                          <div
                            onMouseDown={(event) =>
                              startChartInteraction(event, "right", item)
                            }
                            className="absolute bottom-3 right-0 top-3 z-30 w-2 translate-x-1/2 cursor-e-resize"
                          />

                          {[
                            ["top-left", "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize"],
                            ["top-right", "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize"],
                            ["bottom-left", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize"],
                            ["bottom-right", "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize"],
                          ].map(([mode, position]) => (
                            <button
                              key={mode}
                              type="button"
                              aria-label={`Resize chart from ${mode}`}
                              onMouseDown={(event) =>
                                startChartInteraction(event, mode, item)
                              }
                              className={`absolute z-40 h-3 w-3 rounded-sm border border-[rgb(var(--color-surface))] bg-[rgb(var(--color-primary))] shadow ${position}`}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {(currentSlide.content || []).length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="app-text-muted flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[rgb(var(--color-border-strong))] transition-all hover:bg-[rgb(var(--color-surface-hover))]"
                >
                  <span className="text-2xl">📊</span>
                  <span className="text-xs font-semibold">
                    Add your first chart
                  </span>
                </button>
              )}

              {(currentSlide.content || []).length > 0 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowPicker(true);
                  }}
                  className="btn-primary absolute bottom-3 right-3 z-[100] rounded-lg px-3 py-2 text-xs shadow-lg"
                >
                  + Add chart
                </button>
              )}
            </div>

            {/* Sharp SVG Connector Path Layer - Absolute dimensions prevent stretching distortion */}
            <svg 
              className="absolute inset-0 pointer-events-none z-10"
              style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
            >
              <defs>
                {(currentSlide.annotations || []).map((anno) => (
                  <marker 
                    key={anno.id}
                    id={`arrow-${anno.id}`} 
                    viewBox="0 0 10 10" 
                    refX="6" refY="5" 
                    markerWidth="7" markerHeight="7" 
                    orient="auto-start-reverse"
                  >
                    {/* Sleek, razor-thin sharp triangle matching target UI style */}
                    <path d="M 0 2 L 8 5 L 0 8 z" fill={anno.lineColor || "#64748b"} />
                  </marker>
                ))}
              </defs>
              {(currentSlide.annotations || []).map((anno) => renderConnectorPath(anno))}
            </svg>

            {/* DOM Element Layer */}
            {(currentSlide.annotations || []).map((anno, listIdx) => {
              const isSelected = selectedAnnoId === anno.id;
              return (
                <div key={anno.id} className="absolute inset-0 pointer-events-none z-20">
                  
                  {/* Context Circle Highlight Ring */}
                  {/* Bounding Box Resizable Shape Component Wrapper */}
                  {anno.markerType !== "none" && (
                    <div
                      className={`absolute pointer-events-auto transition-shadow ${
                        isSelected ? 'z-40' : 'z-30'
                      }`}
                      style={{
                        left: `${anno.x}%`,
                        top: `${anno.y}%`,
                        // If it's a dot, use pixels. Otherwise use percentage width.
                        width: anno.markerType === "dot" ? `${(anno.radius || 6) * 2.5}px` : `${anno.width || 15}%`,
                        
                        // FIX: For circles, let CSS calculate height automatically based on width to stay perfectly round
                        height: anno.markerType === "dot" 
                          ? `${(anno.radius || 6) * 2.5}px` 
                          : anno.markerType === "circle" 
                            ? "auto" 
                            : `${anno.height || 15}%`,
                        
                        // FORCE 1:1 aspect ratio strictly for circles
                        aspectRatio: anno.markerType === "circle" ? "1 / 1" : "auto",
                        
                        transform: anno.markerType === "dot" ? 'translate(-50%, -50%)' : 'none',
                      }}
                    >
                      {/* 1. If it's a regular standalone Dot handle */}
                      {anno.markerType === "dot" && (
                        <div 
                          onMouseDown={(e) => handleDragStart(e, "target", anno.id)}
                          onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                          className={`w-full h-full rounded-full cursor-move shadow-md border flex items-center justify-center text-[9px] font-bold text-white transition-transform ${
                            isSelected ? 'ring-4 ring-blue-500/20 border-blue-600' : 'border-white hover:scale-110'
                          }`}
                          style={{ backgroundColor: anno.fillColor }}
                        >
                        </div>
                      )}

                      {/* 2. If it's an expandable visual Circle Ring */}
                      {anno.markerType === "circle" && (
                        <div 
                          onMouseDown={(e) => { if(e.target === e.currentTarget) handleDragStart(e, "target", anno.id) }}
                          onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                          className={`w-full h-full border-2 border-dashed rounded-full cursor-move relative transition-all ${
                            isSelected ? 'border-solid border-blue-500 shadow-xs' : 'hover:border-gray-400'
                          }`}
                          style={{ borderColor: anno.fillColor, backgroundColor: `${anno.fillColor}08` }}
                        >
                        </div>
                      )}

                      {/* 3. If it's an expandable visual Square Block */}
                      {anno.markerType === "square" && (
                        <div 
                          onMouseDown={(e) => { if(e.target === e.currentTarget) handleDragStart(e, "target", anno.id) }}
                          onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                          className={`w-full h-full border-2 border-dashed rounded-lg cursor-move relative transition-all ${
                            isSelected ? 'border-solid border-blue-500 shadow-xs' : 'hover:border-gray-400'
                          }`}
                          style={{ borderColor: anno.fillColor, backgroundColor: `${anno.fillColor}05` }}
                        >
                        </div>
                      )}

                      {/* Dynamic Handle Anchor Link ("Punk Circle") - Displayed only on selection for custom shapes */}
                      {isSelected && anno.markerType !== "dot" && (
                        <div 
                          onMouseDown={(e) => handleDragStart(e, "resize", anno.id, anno)}
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[rgb(var(--color-primary))] border-2 border-[rgb(var(--color-surface))] rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize shadow-md hover:scale-125 transition-transform z-50"
                          title="Drag to resize shape frame layout"
                        />
                      )}
                    </div>
                  )}

                  {/* Floating Content Label Text Box */}
                  <div 
                    onMouseDown={(e) => handleDragStart(e, "label", anno.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                    className={`absolute p-2 pointer-events-auto cursor-move shadow-xs select-text rounded border border-transparent transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 shadow-lg rounded-lg z-50 bg-white border-blue-100' : ''
                    }`}
                    style={{
                      left: `${anno.textX}%`,
                      top: `${anno.textY}%`,
                      transform: 'translate(-50%, -50%)',
                      maxWidth: `${anno.labelWidth || 12}rem`,
                      fontSize: `${anno.textSize || 0.85}rem`,
                      color: anno.textColor || "#1e293b",
                      fontWeight: anno.fontWeight || "normal",
                      textAlign: anno.textAlign || "left",
                      backgroundColor: anno.textBg === "transparent" ? "transparent" : (anno.textBg || "#ffffff"),
                      border: anno.textBg === "outline" ? `1px solid ${anno.textColor}40` : (isSelected ? "1px solid #3b82f6" : "none"),
                      padding: anno.textBg !== "transparent" ? "5px 10px" : "2px"
                    }}
                  >
                    <div className="break-words leading-snug pointer-events-none">
                      {anno.text || "Comment text..."}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* LOWER CONTROLS */}
          <div className="app-border flex justify-between items-center pt-3 border-t mt-auto">
            <div className="flex gap-2">
              <button 
                onClick={() => { setActiveSlideIndex(Math.max(0, activeSlideIndex - 1)); setSelectedAnnoId(null); }}
                disabled={activeSlideIndex === 0}
                className="btn-secondary px-5 py-2 text-sm rounded-xl disabled:opacity-40"
              >
                &larr; Previous
              </button>
              <button 
                onClick={() => { setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1)); setSelectedAnnoId(null); }}
                disabled={activeSlideIndex === slides.length - 1}
                className="btn-primary px-5 py-2 text-sm rounded-xl disabled:opacity-40"
              >
                Next &rarr;
              </button>
            </div>
            <span className="app-text-muted text-xs font-bold uppercase tracking-wider">
              Slide {activeSlideIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Flourish-Style Option Matrix Panels */}
      <div className="app-surface app-border w-80 border-l flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
        
        <div className="flex flex-col gap-2">
          <h3 className="app-text-muted text-xs font-bold uppercase tracking-wider">Annotations Matrix</h3>
          <button 
            onClick={addAnnotation}
            className="btn-secondary w-full py-2 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>➕</span> Add Annotation Point
          </button>
        </div>

        <hr className="app-border" />

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          <h4 className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Points on this slide</h4>
          
          {(currentSlide.annotations || []).length === 0 ? (
            <div className="app-text-muted text-center text-xs italic py-6">No annotations on this slide view.</div>
          ) : (
            (currentSlide.annotations || []).map((anno, listIdx) => {
              const isEditingThis = selectedAnnoId === anno.id;
              return (
                <div 
                  key={anno.id} 
                  className={`app-card rounded-xl transition-all overflow-hidden ${
                    isEditingThis ? 'border-[rgb(var(--color-primary))] shadow-md ring-1 ring-[rgb(var(--color-highlight))]' : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border-strong))]'
                  }`}
                >
                  {/* Summary Bar Card Header Trigger */}
                  <div 
                    onClick={() => setSelectedAnnoId(anno.id)}
                    className={`p-3 cursor-pointer flex items-center justify-between text-xs font-bold transition-colors ${
                      isEditingThis ? 'bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]' : 'app-text-secondary hover:bg-[rgb(var(--color-surface-hover))]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white shrink-0" style={{ backgroundColor: anno.fillColor }}>
                        {listIdx + 1}
                      </span>
                      <span className="truncate font-medium">{anno.text || "Untitled point note..."}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeAnnotation(anno.id); }} className="app-text-muted hover:text-[rgb(var(--color-danger))] font-bold px-1">✕</button>
                  </div>

                  {/* ACTIVE PROPERTIES NESTED SUBPANEL */}
                  {isEditingThis && (
                    <div className="app-surface-secondary app-border p-3 border-t flex flex-col gap-4 text-xs max-h-[400px] overflow-y-auto">
                      
                      {/* Text Entry Field */}
                      <div className="flex flex-col gap-1">
                        <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Annotation Text</label>
                        <textarea 
                          value={anno.text}
                          onChange={(e) => updateAnnotation(anno.id, "text", e.target.value)}
                          rows={2}
                          className="app-input w-full rounded-lg p-2 text-xs resize-none leading-normal font-medium"
                        />
                      </div>

                      {/* Marker Types Form Matrix */}
                      <div className="flex flex-col gap-1">
                        <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Marker Type</label>
                        <div className="app-surface-secondary app-text-secondary grid grid-cols-3 gap-1 p-1 rounded-md text-center font-semibold">
                          {[
                            { id: "none", label: "None" },
                            { id: "dot", label: "Dot •" },
                            { id: "circle", label: "Circle ◯" },
                            { id: "square", label: "Square ▢" }
                          ].map(m => (
                            <button 
                              key={m.id}
                              onClick={() => updateAnnotation(anno.id, "markerType", m.id)}
                              className={`py-1 rounded text-[10px] transition-all ${anno.markerType === m.id ? 'app-surface shadow-xs font-bold text-[rgb(var(--color-primary))]' : 'hover:text-[rgb(var(--color-text))]'}`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Connector Vector Options */}
                      <div className="flex flex-col gap-1">
                        <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Connector Type</label>
                        <div className="app-surface-secondary app-text-secondary grid grid-cols-4 gap-1 p-1 rounded-md text-center font-semibold">
                          {[
                            { id: "none", label: "None" },
                            { id: "curved", label: "Arc" },
                            { id: "straight", label: "Line" },
                            { id: "angled", label: "Elbow" }
                          ].map(c => (
                            <button 
                              key={c.id}
                              onClick={() => updateAnnotation(anno.id, "connectorType", c.id)}
                              className={`py-1 rounded text-[9px] transition-all truncate px-0.5 ${anno.connectorType === c.id ? 'app-surface shadow-xs font-bold text-[rgb(var(--color-primary))]' : 'hover:text-[rgb(var(--color-text))]'}`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accent / Marker Sizing metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Fill Color</label>
                          <input 
                            type="color" 
                            value={anno.fillColor || "#3b82f6"} 
                            onChange={(e) => updateAnnotation(anno.id, "fillColor", e.target.value)}
                            className="app-surface app-border w-full h-8 border rounded-lg p-0.5 cursor-pointer"
                          />
                        </div>

                        
                        {anno.markerType === "dot" && (
                        <div className="flex flex-col gap-1">
                          <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Radius Size</label>
                          <input 
                            type="number" step="1" min="3" max="20"
                            value={anno.radius || 6} 
                            onChange={(e) => updateAnnotation(anno.id, "radius", parseFloat(e.target.value) || 6)}
                            className="app-input w-full h-8 rounded-lg px-2 text-center"
                          />
                        </div>
                        )}
                        
                      </div>

                      {/* Marker Center Text Label Input */}
                      {anno.markerType !== "none" && (
                        <div className="flex flex-col gap-1">
                          <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Marker Center Label</label>
                          <input 
                            type="text" maxLength={2} placeholder="e.g. 1"
                            value={anno.markerLabel || ""} 
                            onChange={(e) => updateAnnotation(anno.id, "markerLabel", e.target.value)}
                            className="app-input w-full h-8 rounded-lg px-2"
                          />
                        </div>
                      )}

                      {/* Text styling & layout parameters wrapper */}
                      <div className="app-border border-t pt-3 flex flex-col gap-3">
                        <span className="app-text-muted text-[10px] font-bold uppercase tracking-wider block mb-1">Text and Connector Styles</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Weight</label>
                            <div className="app-surface-secondary flex p-0.5 rounded-md mt-1">
                              <button 
                                onClick={() => updateAnnotation(anno.id, "fontWeight", "normal")}
                                className={`flex-1 py-1 rounded text-[10px] font-medium ${anno.fontWeight !== "bold" ? "app-surface shadow-xs text-[rgb(var(--color-primary))] font-bold" : "app-text-secondary"}`}
                              >
                                Normal
                              </button>
                              <button 
                                onClick={() => updateAnnotation(anno.id, "fontWeight", "bold")}
                                className={`flex-1 py-1 rounded text-[10px] font-medium ${anno.fontWeight === "bold" ? "app-surface shadow-xs text-[rgb(var(--color-primary))] font-bold" : "app-text-secondary"}`}
                              >
                                Bold
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Text Size (rem)</label>
                            <input 
                              type="number" step="0.05" min="0.5" max="2"
                              value={anno.textSize || 0.85}
                              onChange={(e) => updateAnnotation(anno.id, "textSize", parseFloat(e.target.value) || 0.85)}
                              className="app-input w-full h-7 rounded-md mt-1 text-center px-2 py-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Text Color</label>
                            <input 
                              type="color" value={anno.textColor || "#1e293b"}
                              onChange={(e) => updateAnnotation(anno.id, "textColor", e.target.value)}
                              className="app-surface app-border w-full h-7 border rounded-md p-0.5 mt-1 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Max Width (rem)</label>
                            <input 
                              type="number" min="5" max="30"
                              value={anno.labelWidth || 12}
                              onChange={(e) => updateAnnotation(anno.id, "labelWidth", parseInt(e.target.value) || 12)}
                              className="app-input w-full h-7 rounded-md mt-1 text-center px-2 py-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Background</label>
                            <select 
                              value={anno.textBg || "white"} 
                              onChange={(e) => updateAnnotation(anno.id, "textBg", e.target.value)}
                              className="app-input w-full h-7 rounded-md mt-1 text-[11px] px-1 py-1"
                            >
                              <option value="transparent">Transparent</option>
                              <option value="#ffffff">Solid White</option>
                              <option value="#f1f5f9">Light Gray</option>
                              <option value="outline">Outline Border</option>
                            </select>
                          </div>
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Alignment</label>
                            <select 
                              value={anno.textAlign || "left"} 
                              onChange={(e) => updateAnnotation(anno.id, "textAlign", e.target.value)}
                              className="app-input w-full h-7 rounded-md mt-1 text-[11px] px-1 py-1"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Direct Line / Arrow style toggles */}
                      <div className="app-border border-t pt-3 flex flex-col gap-2">
                        <span className="app-text-muted text-[10px] font-bold uppercase tracking-wider block mb-1">Line Interface Properties</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Line Color</label>
                            <input 
                              type="color" value={anno.lineColor || "#64748b"}
                              onChange={(e) => updateAnnotation(anno.id, "lineColor", e.target.value)}
                              className="app-surface app-border w-full h-7 border rounded-md p-0.5 mt-1 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Thickness (px)</label>
                            <input 
                              type="number" step="0.5" min="0.5" max="8"
                              value={anno.lineWidth || 1.5}
                              onChange={(e) => updateAnnotation(anno.id, "lineWidth", parseFloat(e.target.value) || 1.5)}
                              className="app-input w-full h-7 rounded-md mt-1 text-center px-2 py-1"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

{/* Hidden slides used only for story preview and PDF export */}
{isExporting && (
  <div
    style={{
      position: "fixed",
      left: "-10000px",
      top: 0,
      width: "1280px",
      pointerEvents: "none",
    }}
  >
    {slides.map((slide, slideIndex) => (
      <div
        key={`export-${slide.id}`}
        className="export-slide"
        style={{
          width: "1280px",
          height: "720px",
          padding: "48px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          color: "#0f172a",
        }}
      >
        <h1
          style={{
            height: "48px",
            margin: 0,
            marginBottom: "24px",
            overflow: "hidden",
            fontSize: "34px",
            fontWeight: 700,
            lineHeight: "48px",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {slide.description ||
            `Slide ${slideIndex + 1}`}
        </h1>

        <div
          style={{
            position: "relative",
            width: "1184px",
            height: "552px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            backgroundColor: "#f8fafc",
          }}
        >
          {(slide.content || []).map(
            (item, itemIndex) => (
              <div
                key={
                  item.id ||
                  `${slide.id}-${item.chartId}-${itemIndex}`
                }
                style={{
                  position: "absolute",
                  left: `${item.x ?? 0}%`,
                  top: `${item.y ?? 0}%`,
                  width: `${item.width ?? 100}%`,
                  height: `${item.height ?? 100}%`,
                  zIndex:
                    item.zIndex ??
                    itemIndex + 1,
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Chart"}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: "#ffffff",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      backgroundColor: "#f1f5f9",
                      fontSize: "20px",
                    }}
                  >
                    Chart preview unavailable
                  </div>
                )}
              </div>
            ),
          )}

          {/* Annotation lines */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            {(slide.annotations || []).map(
              (annotation) => {
                if (
                  !annotation.connectorType ||
                  annotation.connectorType ===
                    "none"
                ) {
                  return null;
                }

                const x1 =
                  annotation.textX ?? 55;
                const y1 =
                  annotation.textY ?? 55;
                const x2 =
                  annotation.x ?? 50;
                const y2 =
                  annotation.y ?? 40;

                if (
                  annotation.connectorType ===
                  "curved"
                ) {
                  const middleX =
                    (x1 + x2) / 2;

                  const middleY =
                    (y1 + y2) / 2 - 8;

                  return (
                    <path
                      key={`export-line-${annotation.id}`}
                      d={`M ${x1} ${y1} Q ${middleX} ${middleY} ${x2} ${y2}`}
                      fill="none"
                      stroke={
                        annotation.lineColor ||
                        "#64748b"
                      }
                      strokeWidth={
                        Number(
                          annotation.lineWidth,
                        ) || 1.5
                      }
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }

                if (
                  annotation.connectorType ===
                  "angled"
                ) {
                  return (
                    <path
                      key={`export-line-${annotation.id}`}
                      d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`}
                      fill="none"
                      stroke={
                        annotation.lineColor ||
                        "#64748b"
                      }
                      strokeWidth={
                        Number(
                          annotation.lineWidth,
                        ) || 1.5
                      }
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }

                return (
                  <line
                    key={`export-line-${annotation.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      annotation.lineColor ||
                      "#64748b"
                    }
                    strokeWidth={
                      Number(
                        annotation.lineWidth,
                      ) || 1.5
                    }
                    vectorEffect="non-scaling-stroke"
                  />
                );
              },
            )}
          </svg>

          {/* Annotation markers and labels */}
          {(slide.annotations || []).map(
            (annotation) => (
              <React.Fragment
                key={`export-annotation-${annotation.id}`}
              >
                {annotation.markerType ===
                  "dot" && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        annotation.x ?? 50
                      }%`,
                      top: `${
                        annotation.y ?? 40
                      }%`,
                      width: `${
                        (annotation.radius ||
                          6) * 2
                      }px`,
                      height: `${
                        (annotation.radius ||
                          6) * 2
                      }px`,
                      transform:
                        "translate(-50%, -50%)",
                      borderRadius: "9999px",
                      backgroundColor:
                        annotation.fillColor ||
                        "#3b82f6",
                      zIndex: 30,
                    }}
                  />
                )}

                {annotation.markerType ===
                  "circle" && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        annotation.x ?? 50
                      }%`,
                      top: `${
                        annotation.y ?? 40
                      }%`,
                      width: `${
                        annotation.width ?? 15
                      }%`,
                      aspectRatio: "1 / 1",
                      border: `3px solid ${
                        annotation.fillColor ||
                        "#3b82f6"
                      }`,
                      borderRadius: "9999px",
                      boxSizing: "border-box",
                      zIndex: 30,
                    }}
                  />
                )}

                {annotation.markerType ===
                  "square" && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        annotation.x ?? 50
                      }%`,
                      top: `${
                        annotation.y ?? 40
                      }%`,
                      width: `${
                        annotation.width ?? 15
                      }%`,
                      height: `${
                        annotation.height ?? 15
                      }%`,
                      border: `3px solid ${
                        annotation.fillColor ||
                        "#3b82f6"
                      }`,
                      boxSizing: "border-box",
                      zIndex: 30,
                    }}
                  />
                )}

                <div
                  style={{
                    position: "absolute",
                    left: `${
                      annotation.textX ?? 55
                    }%`,
                    top: `${
                      annotation.textY ?? 55
                    }%`,
                    transform:
                      "translate(-50%, -50%)",
                    maxWidth: `${
                      annotation.labelWidth ||
                      12
                    }rem`,
                    padding: "6px 9px",
                    borderRadius: "6px",
                    color:
                      annotation.textColor ||
                      "#1e293b",
                    backgroundColor:
                      annotation.textBg ===
                      "transparent"
                        ? "transparent"
                        : annotation.textBg ||
                          "#ffffff",
                    fontSize: `${
                      annotation.textSize ||
                      0.85
                    }rem`,
                    fontWeight:
                      annotation.fontWeight ||
                      "normal",
                    textAlign:
                      annotation.textAlign ||
                      "left",
                    zIndex: 40,
                  }}
                >
                  {annotation.text ||
                    "Annotation"}
                </div>
              </React.Fragment>
            ),
          )}
        </div>
      </div>
    ))}
  </div>
)}
      {/* SELECTION MODAL */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="app-card w-full max-w-xl h-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="app-border flex justify-between items-center px-5 py-4 border-b">
              <h2 className="app-text text-base font-bold">Select Project Element Block</h2>
              <button onClick={() => setShowPicker(false)} className="app-text-muted hover:text-[rgb(var(--color-text))] font-bold">✕</button>
            </div>
            <div className="app-surface-secondary app-border p-3 border-b">
              <input 
                type="text" 
                placeholder="Search matching visualization layouts..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="app-input w-full rounded-xl p-2.5 text-xs" 
              />
            </div>
            <div className="app-surface-secondary flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-4">
                {availableProjects
                  .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
                  .map((project) => (
                    <div 
                      key={project.id} 
                      onClick={() => handleProjectClick(project.id)} 
                      className="app-card hover:border-[rgb(var(--color-primary))] rounded-xl p-3 cursor-pointer shadow-2xs transition-all items-center gap-3 group"
                    >
                     <div className="app-surface-secondary app-border flex-1 border-b flex items-center justify-center"> 
                      {project.image_url ? 
                      ( <img src={project.image_url} 
                      alt={project.name} 
                      className="w-full h-24 " /> ) 
                      : ( 
                      <div className="app-text-muted w-full h-24 flex items-center justify-center"> 📊 
                      </div> 
                    )} </div>                   
                      <div className="app-text-secondary font-semibold text-xs truncate">
                        {project.name}
                        </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
    </>
  );
}

export default NewStory;