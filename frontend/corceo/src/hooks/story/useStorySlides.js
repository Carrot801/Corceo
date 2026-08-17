import {
  useCallback,
} from "react";

import {
  apiRequest,
} from "../../api/client";


function useStorySlides({
  storyId,

  slides,
  setSlides,

  activeSlideIndex,
  setActiveSlideIndex,
  setSelectedAnnoId,
  setSelectedChartId,

  saveStory,
  reloadSavedStory,
  normalizeStorySlides,

  isSlideActionRef,
}) {

  // =========================
  // ADD SLIDE
  // =========================

  const addSlide =
    useCallback(() => {
      const newSlide = {
        id:
          `temp-${Date.now()}-${crypto.randomUUID()}`,

        content: [],

        description: "",

        annotations: [],
      };

      setSlides(
        (previousSlides) => {
          const updatedSlides = [
            ...previousSlides,
            newSlide,
          ];

          setActiveSlideIndex(
            updatedSlides.length - 1
          );

          return updatedSlides;
        }
      );

      setSelectedAnnoId(null);
      setSelectedChartId(null);

    }, [
      setActiveSlideIndex,
      setSelectedAnnoId,
      setSelectedChartId,
      setSlides,
    ]);


  // =========================
  // REORDER SLIDES
  // =========================

  const reorderSlides =
    useCallback(
      (
        fromIndex,
        toIndex
      ) => {
        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >=
            slides.length ||
          toIndex >=
            slides.length
        ) {
          return;
        }

        /*
         * Remember which slide is currently
         * selected before changing positions.
         */
        const activeSlideId =
          slides[
            activeSlideIndex
          ]?.id;

        /*
         * Reorder actual story state.
         */
        setSlides(
          (previousSlides) => {
            const reordered = [
              ...previousSlides,
            ];

            const [
              movedSlide,
            ] = reordered.splice(
              fromIndex,
              1
            );

            if (!movedSlide) {
              return previousSlides;
            }

            reordered.splice(
              toIndex,
              0,
              movedSlide
            );

            return reordered;
          }
        );

        /*
         * Create the same reordered array
         * locally so we can determine where
         * the currently selected slide moved.
         */
        const reorderedPreview = [
          ...slides,
        ];

        const [
          movedSlide,
        ] =
          reorderedPreview.splice(
            fromIndex,
            1
          );

        if (!movedSlide) {
          return;
        }

        reorderedPreview.splice(
          toIndex,
          0,
          movedSlide
        );

        const newActiveIndex =
          reorderedPreview.findIndex(
            (slide) =>
              slide.id ===
              activeSlideId
          );

        if (
          newActiveIndex !== -1
        ) {
          setActiveSlideIndex(
            newActiveIndex
          );
        }

        setSelectedAnnoId(null);
        setSelectedChartId(null);
      },
      [
        activeSlideIndex,
        setActiveSlideIndex,
        setSelectedAnnoId,
        setSelectedChartId,
        setSlides,
        slides,
      ]
    );


  // =========================
  // DUPLICATE SLIDE
  // =========================

  const duplicateSlide =
    useCallback(
      async (index) => {
        const sourceSlide =
          slides[index];

        if (!sourceSlide) {
          console.error(
            "Cannot duplicate: slide does not exist",
            index
          );

          return;
        }

        try {
          /*
           * Save the story first.
           *
           * This is important because the
           * selected slide may still have a
           * temporary frontend ID.
           */
          const actualStoryId =
            await saveStory();

          if (!actualStoryId) {
            throw new Error(
              "Story could not be saved before duplicating the slide."
            );
          }

          /*
           * Load the canonical database
           * representation after saving.
           */
          const storyData =
            await apiRequest(
              `/stories/${actualStoryId}`
            );

          const canonicalSlides =
            normalizeStorySlides(
              storyData
            );

          const canonicalSourceSlide =
            canonicalSlides[
              index
            ];

          if (
            !canonicalSourceSlide?.id
          ) {
            throw new Error(
              "The saved slide has no database ID."
            );
          }

          isSlideActionRef.current =
            true;

          /*
           * Duplicate the persisted slide
           * through the backend.
           */
          await apiRequest(
            `/stories/${actualStoryId}/slides/${canonicalSourceSlide.id}/duplicate`,
            {
              method: "POST",
            }
          );

          /*
           * Reload the story so frontend state
           * matches the database.
           */
          const updatedStory =
            await reloadSavedStory(
              actualStoryId
            );

          const updatedSlides =
            Array.isArray(
              updatedStory?.slides
            )
              ? updatedStory.slides
              : [];

          const duplicatedIndex =
            Math.min(
              index + 1,
              Math.max(
                updatedSlides.length - 1,
                0
              )
            );

          setActiveSlideIndex(
            duplicatedIndex
          );

          setSelectedAnnoId(null);
          setSelectedChartId(null);

        } catch (error) {
          console.error(
            "Duplicate slide error:",
            error
          );

        } finally {
          /*
           * Persistence code uses this ref
           * to distinguish explicit slide
           * actions from ordinary autosave.
           */
          setTimeout(
            () => {
              isSlideActionRef.current =
                false;
            },
            300
          );
        }
      },
      [
        isSlideActionRef,
        normalizeStorySlides,
        reloadSavedStory,
        saveStory,
        setActiveSlideIndex,
        setSelectedAnnoId,
        setSelectedChartId,
        slides,
      ]
    );


  // =========================
  // DELETE SLIDE
  // =========================

  const deleteSlide =
    useCallback(
      async (index) => {
        const targetSlide =
          slides[index];

        if (!targetSlide) {
          return;
        }

        const slideId =
          targetSlide.id;

        /*
         * Update frontend state after a
         * successful delete, or immediately
         * when deleting a temporary slide.
         */
        const removeSlideLocally =
          () => {
            setSlides(
              (previousSlides) => {
                const updatedSlides =
                  previousSlides.filter(
                    (slide) =>
                      String(
                        slide.id
                      ) !==
                      String(
                        slideId
                      )
                  );

                /*
                 * A story should always contain
                 * at least one editable slide.
                 */
                if (
                  updatedSlides.length >
                  0
                ) {
                  return updatedSlides;
                }

                return [
                  {
                    id:
                      `temp-${Date.now()}-${crypto.randomUUID()}`,

                    content: [],

                    description: "",

                    annotations: [],
                  },
                ];
              }
            );

            /*
             * Keep the active index valid
             * after deleting a slide.
             */
            setActiveSlideIndex(
              (currentIndex) => {
                const nextLength =
                  Math.max(
                    slides.length - 1,
                    1
                  );

                if (
                  currentIndex >
                  index
                ) {
                  return (
                    currentIndex - 1
                  );
                }

                if (
                  currentIndex ===
                  index
                ) {
                  return Math.min(
                    index,
                    nextLength - 1
                  );
                }

                return currentIndex;
              }
            );

            setSelectedAnnoId(
              null
            );

            setSelectedChartId(
              null
            );
          };


        // =========================
        // TEMPORARY SLIDE
        // =========================

        /*
         * Temporary slides have not yet
         * been stored in PostgreSQL,
         * therefore no API call is needed.
         */
        if (
          String(
            slideId
          ).startsWith(
            "temp-"
          )
        ) {
          removeSlideLocally();
          return;
        }


        // =========================
        // SAVED SLIDE
        // =========================

        try {
          if (!storyId) {
            throw new Error(
              "Cannot delete a saved slide without a story ID."
            );
          }

          isSlideActionRef.current =
            true;

          await apiRequest(
            `/stories/${storyId}/slides/${slideId}`,
            {
              method: "DELETE",
            }
          );

          removeSlideLocally();

        } catch (error) {
          console.error(
            "Delete slide error:",
            error
          );

        } finally {
          setTimeout(
            () => {
              isSlideActionRef.current =
                false;
            },
            500
          );
        }
      },
      [
        isSlideActionRef,
        setActiveSlideIndex,
        setSelectedAnnoId,
        setSelectedChartId,
        setSlides,
        slides,
        storyId,
      ]
    );


  // =========================
  // PUBLIC API OF THE HOOK
  // =========================

  return {
    addSlide,
    reorderSlides,
    duplicateSlide,
    deleteSlide,
  };
}


export default useStorySlides;