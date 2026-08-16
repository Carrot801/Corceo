import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import StoryChart from "../components/StoryChart";

import AnnotationLayer from "../components/annotations/AnnotationLayer";

import {
  apiRequest,
} from "../api/client";

function PublishedStory() {
  const { storyId } =
    useParams();

  const [
    story,
    setStory,
  ] = useState(null);
const [
  loadError,
  setLoadError,
] = useState(null);
  const [
    activeSlideIndex,
    setActiveSlideIndex,
  ] = useState(0);

  const [
    canvasSize,
    setCanvasSize,
  ] = useState({
    width: 0,
    height: 0,
  });
const [
  hoveredChartId,
  setHoveredChartId,
] = useState(null);
  const canvasRef =
    useRef(null);

  // =========================
  // LOAD STORY
  // =========================
useEffect(() => {
  let cancelled = false;

  const loadStory = async () => {
    setLoadError(null);

    // =========================
    // 1. TRY PUBLIC STORY
    // =========================

    try {
      const publicStory =
        await apiRequest(
          `/stories/public/${storyId}`,
          {
            auth: false,
          }
        );

      if (cancelled) {
        return;
      }

      setStory(publicStory);
      return;

    } catch (publicError) {
      // Story may simply be unpublished.
      // In that case try authenticated
      // owner access below.
    }


    // =========================
    // 2. TRY PRIVATE OWNER VIEW
    // =========================

    try {
      const privateStory =
        await apiRequest(
          `/stories/${storyId}`
        );

      if (cancelled) {
        return;
      }

      setStory(privateStory);

    } catch (privateError) {
      if (cancelled) {
        return;
      }

      console.error(
        "Story load failed:",
        privateError
      );

      setLoadError(
        "This story does not exist, is private, or you do not have permission to view it."
      );
    }
  };

  loadStory();

  return () => {
    cancelled = true;
  };
}, [storyId]);
  // =========================
  // OBSERVE CANVAS SIZE
  // =========================

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateSize =
      () => {
        const rect =
          canvas.getBoundingClientRect();

        setCanvasSize({
          width:
            rect.width,

          height:
            rect.height,
        });
      };

    updateSize();

    const observer =
      new ResizeObserver(
        updateSize,
      );

    observer.observe(
      canvas,
    );

    return () => {
      observer.disconnect();
    };
  }, [
    story,
    activeSlideIndex,
  ]);

  // =========================
  // LOADING
  // =========================

  if (loadError) {
  return (
    <div
      className="
        flex
        h-screen
        items-center
        justify-center
        p-6
        text-center
      "
    >
      <div>
        <h1 className="text-xl font-bold">
          Story unavailable
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {loadError}
        </p>
      </div>
    </div>
  );
}
  if (!story) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading story...
      </div>
    );
  }

  const slides =
    Array.isArray(
      story.slides,
    )
      ? story.slides
      : [];

  if (
    slides.length === 0
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        This story has no slides.
      </div>
    );
  }

  const currentSlide =
    slides[
      activeSlideIndex
    ];

  // =========================
  // NAVIGATION
  // =========================

  const goPrev = () => {
    setActiveSlideIndex(
      (previous) =>
        Math.max(
          0,
          previous - 1,
        ),
    );
  };

  const goNext = () => {
    setActiveSlideIndex(
      (previous) =>
        Math.min(
          slides.length - 1,
          previous + 1,
        ),
    );
  };

  return (
    <div className="
      flex
      h-screen
      w-screen
      flex-col
      items-center
      justify-center
      bg-slate-100
      p-8
    ">
      <div className="
        flex
        h-[520px] 
        md:h-[620px] 
        xl:h-[720px]
        w-full
        max-w-6xl
        flex-col
        rounded-2xl
        bg-white
        p-8
        shadow-xl
      ">
        {/* ================= */}
        {/* SLIDE TITLE */}
        {/* ================= */}

        <h1 className="mb-6 text-3xl font-bold">
          {currentSlide?.description ||
            story.name}
        </h1>

        {/* ================= */}
        {/* SLIDE CANVAS */}
        {/* ================= */}

        <div
          ref={canvasRef}
          className="
            relative
            flex-1
            overflow-visible
            rounded-xl
            border
            bg-slate-50
          "
        >
          {/* ================= */}
          {/* CHARTS */}
          {/* ================= */}

{(
  currentSlide?.content ||
  []
).map(
  (item) => (
    <div
      key={item.id}

      className="
        absolute
        overflow-visible
      "

      onMouseEnter={() => {
        setHoveredChartId(
          item.id
        );
      }}

      onMouseLeave={() => {
        setHoveredChartId(
          null
        );
      }}

      style={{
        left:
          `${
            item.x ??
            0
          }%`,

        top:
          `${
            item.y ??
            0
          }%`,

        width:
          `${
            item.width ??
            100
          }%`,

        height:
          `${
            item.height ??
            100
          }%`,

        zIndex:
          hoveredChartId ===
          item.id
            ? 10000
            : item.zIndex ??
              1,
      }}
    >
                <div className="relative h-full w-full overflow-visible bg-white">
                  <StoryChart
                    chartId={
                      item.chartId
                    }
                    storyMode
                  />
                </div>
              </div>
            ),
          )}

          {/* ================= */}
          {/* ANNOTATIONS */}
          {/* ================= */}

          <AnnotationLayer
            annotations={
              currentSlide?.annotations ||
              []
            }
            width={
              canvasSize.width
            }
            height={
              canvasSize.height
            }
            interactive={
              false
            }
            idPrefix={`published-story-${storyId}-${activeSlideIndex}`}
          />
        </div>

        {/* ================= */}
        {/* NAVIGATION */}
        {/* ================= */}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={
              goPrev
            }
            disabled={
              activeSlideIndex ===
              0
            }
            className="
              rounded-lg
              bg-gray-200
              px-5
              py-2
              disabled:opacity-40
            "
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-500">
            Slide{" "}
            {activeSlideIndex +
              1}{" "}
            /{" "}
            {slides.length}
          </div>

          <button
            type="button"
            onClick={
              goNext
            }
            disabled={
              activeSlideIndex ===
              slides.length -
                1
            }
            className="
              rounded-lg
              bg-blue-600
              px-5
              py-2
              text-white
              disabled:opacity-40
            "
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishedStory;