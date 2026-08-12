import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Header from "../components/Header";
import useHistoryState from "../hooks/useHistoryState";

import StoryTopToolbar from "../components/story/StoryTopToolbar";
import StorySlidesSidebar from "../components/story/StorySlidesSidebar";
import StoryMainCanvas from "../components/story/StoryMainCanvas";
import StoryAnnotationsSidebar from "../components/story/StoryAnnotationsSidebar";
import StoryExportSlides from "../components/story/StoryExportSlides";
import StoryProjectPickerModal from "../components/story/StoryProjectPickerModal";

import { apiRequest } from "../api/client";
export const DEFAULT_CHART_ASPECT_RATIO = 16 / 9;

export function createChartItem(
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
  const SLIDE_WIDTH = 1280;
  const SLIDE_HEIGHT = 720;
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
      [SLIDE_WIDTH, SLIDE_HEIGHT],
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
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor:
              "#ffffff",
            logging: false,
          },
        );

      const imageData =
  canvas.toDataURL("image/png");

      if (index > 0) {
        pdf.addPage(
          [1280, 720],
          "landscape",
        );
      }

      pdf.addImage(
  imageData,
  "PNG",
  0,
  0,
  SLIDE_WIDTH,
  SLIDE_HEIGHT
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
) => {
  const storyData = await apiRequest(
    `/stories/${savedStoryId}`,
  );


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

    const actualStoryId = await saveStory();

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "No authentication token found",
      );
    }
const storyData = await apiRequest(
  `/stories/${actualStoryId}`,
);
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

await apiRequest(
  `/stories/${actualStoryId}/slides/${canonicalSourceSlide.id}/duplicate`,
  {
    method: "POST",
  },
);

const updatedStory =
  await reloadSavedStory(
    actualStoryId,
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

    await apiRequest(
      `/stories/${storyId}/slides/${slideId}`,
      {
        method: "DELETE",
      },
    );

    removeSlideLocally();
  } catch (err) {
    console.error("Delete slide error:", err);
  } finally {
    setTimeout(() => {
      isSlideActionRef.current = false;
    }, 500);
  }
};

function withCurrentRatio(item) {
  const width = Number(item.width) || 1;
  const height = Number(item.height) || 1;

  return {
    ...item,
    aspectRatio: width / height,
  };
}

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

const saveStory = async () => {
  const isNew =
    storyId === "new" ||
    !storyId ||
    storyId ===
      "undefined";

  const path = isNew
    ? "/stories"
    : `/stories/${storyId}`;

  try {
    isSlideActionRef.current =
      true;

    const image_url =
      await makeStoryPreview();

    const result =
      await apiRequest(
        path,
        {
          method: isNew
            ? "POST"
            : "PUT",

          body: JSON.stringify({
            name: storyName,
            slides: cleanSlides,
            image_url,
          }),
        },
      );

    const actualStoryId =
      isNew
        ? result.id
        : storyId;

    if (!actualStoryId) {
      throw new Error(
        "The backend did not return a story ID.",
      );
    }

    await reloadSavedStory(
      actualStoryId,
    );

    hasLoadedStoryRef.current =
      true;

    if (isNew) {
      navigate(
        `/stories/${actualStoryId}`,
        {
          replace: true,
        },
      );
    }

    return actualStoryId;
  } catch (error) {
    console.error(
      "Save story failed:",
      error,
    );

    throw error;
  } finally {
    setTimeout(() => {
      isSlideActionRef.current =
        false;
    }, 300);
  }
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
  if (
    !storyId ||
    storyId === "new" ||
    storyId === "undefined"
  ) {
    return;
  }

  let cancelled = false;

  const loadStory = async () => {
    try {
      const data = await apiRequest(
        `/stories/${storyId}`,
      );

      if (cancelled) {
        return;
      }

      hasLoadedStoryRef.current = true;

      resetStoryHistory({
        storyName:
          data.name ||
          "Untitled Story",

        slides:
          data.slides?.length
            ? normalizeStorySlides(data)
            : createInitialStoryState().slides,
      });
    } catch (err) {
      if (!cancelled) {
        console.error(
          "Failed to load story:",
          err,
        );
      }
    }
  };

  loadStory();

  return () => {
    cancelled = true;
  };
}, [
  storyId,
  resetStoryHistory,
]);


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


const result = await apiRequest(
  path,
  {
    method:
      isNew
        ? "POST"
        : "PUT",

    body: JSON.stringify({
      name: storyName,
      slides: cleanSlides,
      image_url,
    }),
  },
);

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

    const actualStoryId = await saveStory();

    if (!actualStoryId) {
      throw new Error(
        "The story could not be saved before publishing",
      );
    }

    await apiRequest(
      `/stories/${actualStoryId}/publish`,
      {
        method: "PUT",
      },
    );

   

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
            renderConnectorPath={renderConnectorPath}
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
