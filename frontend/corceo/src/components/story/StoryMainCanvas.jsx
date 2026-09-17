import StorySlideContent
  from "./StorySlideContent";


function StoryMainCanvas({
  activeSlideIndex,

  currentSlide,
  setSlides,
  slides,

  canvasRef,

  selectedChartId,
  selectedAnnoId,

  setSelectedChartId,
  setSelectedAnnoId,

  startChartInteraction,

  duplicateChartItem,
  deleteChartItem,
  sendChartToBack,

  setShowPicker,

  canvasDimensions,

  handleDragStart,

  setActiveSlideIndex,
}) {
  return (
    <div
      className="
        flex-1
        p-8
        flex
        flex-col
        items-center
        justify-center
        overflow-hidden
      "
    >
      <div
        className="
          story-slide
          app-card
          w-full
          max-w-4xl
          shadow-xl
          h-[520px]
          lg:h-[620px]
          rounded-2xl
          p-4
          lg:p-6
          flex
          flex-col
          gap-4
          relative
        "
      >
       <div
  className="
    story-pdf-slide
    min-h-0
    flex-1
    flex
    flex-col
    gap-4
  "
>
  {/* ========================= */}
  {/* SLIDE TITLE */}
  {/* ========================= */}

  <input
    type="text"
    placeholder={
      `Slide ${
        activeSlideIndex + 1
      }`
    }
    value={
      currentSlide.description ||
      ""
    }
    onChange={(event) => {
      const newTitle =
        event.target.value;

      setSlides(
        (
          previousSlides
        ) =>
          previousSlides.map(
            (
              slide,
              index
            ) =>
              index ===
              activeSlideIndex
                ? {
                    ...slide,
                    description:
                      newTitle,
                  }
                : slide
          )
      );
    }}
    className="
      app-text
      w-full
      bg-transparent
      text-2xl
      font-bold
      outline-none
      border-b
      border-transparent
      hover:border-[rgb(var(--color-border))]
      focus:border-[rgb(var(--color-highlight))]
      pb-2
      transition-colors
      placeholder:text-slate-400
    "
  />


  {/* ========================= */}
  {/* ACTUAL SLIDE CONTENT */}
  {/* ========================= */}

  <div className="min-h-0 flex-1">
    <StorySlideContent
      slide={
        currentSlide
      }

      slideIndex={
        activeSlideIndex
      }

      interactive

      canvasRef={
        canvasRef
      }

      canvasDimensions={
        canvasDimensions
      }

      selectedChartId={
        selectedChartId
      }

      selectedAnnoId={
        selectedAnnoId
      }

      setSelectedChartId={
        setSelectedChartId
      }

      setSelectedAnnoId={
        setSelectedAnnoId
      }

      startChartInteraction={
        startChartInteraction
      }

      duplicateChartItem={
        duplicateChartItem
      }

      deleteChartItem={
        deleteChartItem
      }

      sendChartToBack={
        sendChartToBack
      }

      setShowPicker={
        setShowPicker
      }

      handleDragStart={
        handleDragStart
      }
    />
  </div>
</div>

        {/* ========================= */}
        {/* LOWER CONTROLS */}
        {/* ========================= */}

        <div
          className="
            app-border
            flex
            justify-between
            items-center
            pt-3
            border-t
            mt-auto
          "
        >
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveSlideIndex(
                  Math.max(
                    0,
                    activeSlideIndex -
                      1
                  )
                );

                setSelectedAnnoId(
                  null
                );

                setSelectedChartId(
                  null
                );
              }}
              disabled={
                activeSlideIndex ===
                0
              }
              className="
                btn-secondary
                px-5
                py-2
                text-sm
                rounded-xl
                disabled:opacity-40
              "
            >
              ← Previous
            </button>

            <button
              onClick={() => {
                setActiveSlideIndex(
                  Math.min(
                    slides.length -
                      1,
                    activeSlideIndex +
                      1
                  )
                );

                setSelectedAnnoId(
                  null
                );

                setSelectedChartId(
                  null
                );
              }}
              disabled={
                activeSlideIndex ===
                slides.length - 1
              }
              className="
                btn-primary
                px-5
                py-2
                text-sm
                rounded-xl
                disabled:opacity-40
              "
            >
              Next →
            </button>
          </div>

          <span
            className="
              app-text-muted
              text-xs
              font-bold
              uppercase
              tracking-wider
            "
          >
            Slide{" "}
            {activeSlideIndex +
              1}{" "}
            / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}


export default StoryMainCanvas;