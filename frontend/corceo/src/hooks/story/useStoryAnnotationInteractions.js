import {
  useCallback,
  useEffect,
  useRef,
} from "react";


export default function useStoryAnnotationInteractions({
  canvasRef,
  dragContextRef,

  activeSlideIndex,

  setSlidesDuringDrag,

  setSelectedAnnoId,
  setSelectedChartId,

  storyStateRef,
  commitStoryHistory,
}) {
  // Keep the newest version of setSlidesDuringDrag
  // without recreating the mousemove handler.
  const setSlidesDuringDragRef =
    useRef(setSlidesDuringDrag);

  useEffect(() => {
    setSlidesDuringDragRef.current =
      setSlidesDuringDrag;
  }, [setSlidesDuringDrag]);


  // =========================
  // DRAG MOVE
  // =========================

  const handleDragMove =
    useCallback(
      (event) => {
        if (
          !canvasRef.current ||
          !dragContextRef.current?.annoId
        ) {
          return;
        }

        const rect =
          canvasRef.current
            .getBoundingClientRect();

        if (
          !rect.width ||
          !rect.height
        ) {
          return;
        }

        const context =
          dragContextRef.current;

        dragContextRef.current = {
          ...context,
          hasMoved: true,
        };


        // =========================
        // ABSOLUTE MOUSE POSITION
        // =========================

        let percentageX =
          (
            (
              event.clientX -
              rect.left
            ) /
            rect.width
          ) *
          100;

        let percentageY =
          (
            (
              event.clientY -
              rect.top
            ) /
            rect.height
          ) *
          100;

        percentageX =
          Math.max(
            0,
            Math.min(
              100,
              percentageX
            )
          );

        percentageY =
          Math.max(
            0,
            Math.min(
              100,
              percentageY
            )
          );


        // =========================
        // RESIZE DELTA
        // =========================

        const deltaPercentageX =
          (
            (
              event.clientX -
              context.startX
            ) /
            rect.width
          ) *
          100;

        const deltaPercentageY =
          (
            (
              event.clientY -
              context.startY
            ) /
            rect.height
          ) *
          100;


        // =========================
        // UPDATE ANNOTATION
        // =========================

        setSlidesDuringDragRef.current(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                return {
                  ...slide,

                  annotations: (
                    slide.annotations ||
                    []
                  ).map(
                    (annotation) => {
                      if (
                        annotation.id !==
                        context.annoId
                      ) {
                        return annotation;
                      }


                      // =========================
                      // MOVE TARGET
                      // =========================

                      if (
                        context.type ===
                        "target"
                      ) {
                        return {
                          ...annotation,

                          x:
                            percentageX,

                          y:
                            percentageY,
                        };
                      }


                      // =========================
                      // MOVE LABEL
                      // =========================

                      if (
                        context.type ===
                        "label"
                      ) {
                        return {
                          ...annotation,

                          textX:
                            percentageX,

                          textY:
                            percentageY,
                        };
                      }


                      // =========================
                      // RESIZE
                      // =========================

                      if (
                        context.type ===
                        "resize"
                      ) {
                        if (
                          annotation.markerType ===
                          "circle"
                        ) {
                          const uniformDelta =
                            (
                              deltaPercentageX +
                              deltaPercentageY
                            ) /
                            2;

                          const newSize =
                            Math.max(
                              3,

                              context.startWidth +
                                uniformDelta
                            );

                          return {
                            ...annotation,

                            width:
                              newSize,

                            height:
                              newSize,
                          };
                        }

                        return {
                          ...annotation,

                          width:
                            Math.max(
                              3,

                              context.startWidth +
                                deltaPercentageX
                            ),

                          height:
                            Math.max(
                              3,

                              context.startHeight +
                                deltaPercentageY
                            ),
                        };
                      }

                      return annotation;
                    }
                  ),
                };
              }
            )
        );
      },
      [
        activeSlideIndex,
        canvasRef,
        dragContextRef,
      ]
    );


  // =========================
  // DRAG END
  // =========================

  const handleDragEnd =
    useCallback(() => {
      const context =
        dragContextRef.current;

      document.removeEventListener(
        "mousemove",
        handleDragMove
      );


      if (
        context?.hasMoved &&
        context?.startingStoryState &&
        context?.latestStoryState
      ) {
        commitStoryHistory(
          context.startingStoryState,
          context.latestStoryState
        );
      }

      dragContextRef.current = {
        type: null,
        annoId: null,

        startingStoryState:
          null,

        latestStoryState:
          null,

        hasMoved:
          false,
      };
    }, [
      commitStoryHistory,
      dragContextRef,
      handleDragMove,
    ]);


  // =========================
  // DRAG START
  // =========================

  const handleDragStart =
    useCallback(
      (
        event,
        type,
        annoId,
        currentAnno = null
      ) => {
        event.stopPropagation();
        event.preventDefault();

        setSelectedAnnoId(
          annoId
        );

        setSelectedChartId(
          null
        );

        dragContextRef.current = {
          type,
          annoId,

          startX:
            event.clientX,

          startY:
            event.clientY,

          startWidth:
            currentAnno?.width ??
            15,

          startHeight:
            currentAnno?.height ??
            15,

          startingStoryState:
            structuredClone(
              storyStateRef.current
            ),

          latestStoryState:
            structuredClone(
              storyStateRef.current
            ),

          hasMoved:
            false,
        };

        document.addEventListener(
          "mousemove",
          handleDragMove
        );

        document.addEventListener(
            "mouseup",
            handleDragEnd,
            {
                once: true,
            }
        );
      },
      [
        dragContextRef,
        handleDragEnd,
        handleDragMove,
        setSelectedAnnoId,
        setSelectedChartId,
        storyStateRef,
      ]
    );


  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      document.removeEventListener(
        "mousemove",
        handleDragMove
      );

      document.removeEventListener(
        "mouseup",
        handleDragEnd
      );
    };
  }, [
    handleDragEnd,
    handleDragMove,
  ]);


  return {
    handleDragStart,
  };
}