import {
  useCallback,
} from "react";


export default function useStoryAnnotations({
  activeSlideIndex,

  currentSlide,

  setSlides,

  selectedAnnoId,
  setSelectedAnnoId,
}) {

  // =========================
  // ADD ANNOTATION
  // =========================

  const addAnnotation =
    useCallback(() => {
      const newId =
        `anno-${crypto.randomUUID()}`;

      const count =
        (
          currentSlide
            ?.annotations ||
          []
        ).length + 1;

      const newAnnotation = {
        id:
          newId,

        text:
          `Annotation point #${count}`,

        markerType:
          "dot",

        connectorType:
          "curved",

        x: 50,
        y: 40,

        textX: 55,
        textY: 55,

        width: 15,
        height: 15,

        fillColor:
          "#3b82f6",

        radius: 6,

        labelWidth: 12,

        textSize: 0.85,

        textColor:
          "#1e293b",

        textBg:
          "white",

        fontWeight:
          "normal",

        textAlign:
          "left",

        lineWidth: 1.5,

        lineColor:
          "#64748b",
      };

      setSlides(
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

                annotations: [
                  ...(
                    slide.annotations ||
                    []
                  ),

                  newAnnotation,
                ],
              };
            }
          )
      );

      setSelectedAnnoId(
        newId
      );

    }, [
      activeSlideIndex,
      currentSlide,
      setSelectedAnnoId,
      setSlides,
    ]);


  // =========================
  // UPDATE ANNOTATION
  // =========================

  const updateAnnotation =
    useCallback(
      (
        annotationId,
        key,
        value
      ) => {
        setSlides(
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
                    (annotation) =>
                      annotation.id ===
                      annotationId
                        ? {
                            ...annotation,

                            [key]:
                              value,
                          }
                        : annotation
                  ),
                };
              }
            )
        );
      },
      [
        activeSlideIndex,
        setSlides,
      ]
    );


  // =========================
  // REMOVE ANNOTATION
  // =========================

  const removeAnnotation =
    useCallback(
      (annotationId) => {
        setSlides(
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
                  ).filter(
                    (annotation) =>
                      annotation.id !==
                      annotationId
                  ),
                };
              }
            )
        );

        if (
          selectedAnnoId ===
          annotationId
        ) {
          setSelectedAnnoId(
            null
          );
        }
      },
      [
        activeSlideIndex,
        selectedAnnoId,
        setSelectedAnnoId,
        setSlides,
      ]
    );


  return {
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
  };
}