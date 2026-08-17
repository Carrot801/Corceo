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
import useStoryCharts
  from "../hooks/story/useStoryCharts";
import useStoryAnnotations
  from "../hooks/story/useStoryAnnotations";
import useStoryAnnotationInteractions
  from "../hooks/story/useStoryAnnotationInteractions";
import useStoryChartInteractions
  from "../hooks/story/useStoryChartInteractions";


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
      if (dragContextRef.current) {
        dragContextRef.current.latestStoryState =
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
const dragContextRef =
  useRef({
    type: null,
    annoId: null,
  });
  
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

const {
  addChartToSlide,
  updateChartItem,
  deleteChartItem,
  duplicateChartItem,
  bringChartToFront,
  sendChartToBack,
} = useStoryCharts({
  activeSlideIndex,

  setSlides,

  setSelectedChartId,
  setSelectedAnnoId,
  setShowPicker,
});

const {
  addAnnotation,
  updateAnnotation,
  removeAnnotation,
} = useStoryAnnotations({
  activeSlideIndex,

  currentSlide,

  setSlides,

  selectedAnnoId,
  setSelectedAnnoId,
});

const {
  handleDragStart,
} = useStoryAnnotationInteractions({
  canvasRef,
  dragContextRef,

  activeSlideIndex,

  setSlidesDuringDrag,

  setSelectedAnnoId,
  setSelectedChartId,

  storyStateRef,
  commitStoryHistory,
});

const {
  startChartInteraction,
} = useStoryChartInteractions({
  canvasRef,
  chartInteractionRef,

  updateChartItem,
  bringChartToFront,

  setSelectedChartId,
  setSelectedAnnoId,

  storyStateRef,
  commitStoryHistory,
});

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
