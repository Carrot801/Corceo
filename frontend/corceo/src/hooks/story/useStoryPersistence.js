import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { apiRequest } from "../../api/client";

function normalizeStorySlides(
  storyData,
) {
  return (
    storyData?.slides || []
  ).map((slide) => ({
    ...slide,

    id: slide.id,

    description:
      slide.description || "",

    annotations:
      slide.annotations || [],

    content:
      (slide.content || []).map(
        (item, index) => ({
          ...item,

          id:
            item.id ||
            `chart-instance-${slide.id}-${item.chartId ?? item.chart_id}-${index}`,

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

          name:
            item.name ||
            "Chart",

          type:
            item.type ||
            "chart",

          x: Number(
            item.x ?? 0,
          ),

          y: Number(
            item.y ?? 0,
          ),

          width: Number(
            item.width ?? 100,
          ),

          height: Number(
            item.height ?? 100,
          ),

          zIndex: Number(
            item.zIndex ??
              item.z_index ??
              index + 1,
          ),
        }),
      ),
  }));
}

function serializeStorySlides(
  slides,
) {
  return (slides || []).map(
    (slide) => {
      const isTemporary =
        String(
          slide.id,
        ).startsWith(
          "temp-",
        );

      return {
        ...slide,

        id: isTemporary
          ? undefined
          : slide.id,

        content:
          (slide.content || []).map(
            (
              item,
              index,
            ) => ({
              id: item.id,

              type:
                item.type ||
                "chart",

              chartId:
                item.chartId,

              name:
                item.name ||
                "Chart",

              imageUrl:
                item.imageUrl ||
                null,

              x: Number(
                item.x ?? 0,
              ),

              y: Number(
                item.y ?? 0,
              ),

              width: Number(
                item.width ??
                  100,
              ),

              height: Number(
                item.height ??
                  100,
              ),

              zIndex: Number(
                item.zIndex ??
                  index + 1,
              ),
            }),
          ),

        annotations:
          slide.annotations ||
          [],
      };
    },
  );
}

function useStoryPersistence({
  storyId,
  storyName,
  slides,

  setStoryHistoryState,
  resetStoryHistory,

  createInitialStoryState,

  makeStoryPreview,

  isSlideActionRef,

  navigate,

  autosaveDelay = 1200,
}) {
  const hasLoadedStoryRef =
    useRef(false);

  const autosaveTimerRef =
    useRef(null);

  const pauseTimerRef =
    useRef(null);

  /*
   * Keep latest preview function without
   * forcing persistence callbacks to be
   * recreated only because its identity
   * changed after a render.
   */
  const makeStoryPreviewRef =
    useRef(
      makeStoryPreview,
    );

  useEffect(() => {
    makeStoryPreviewRef.current =
      makeStoryPreview;
  }, [makeStoryPreview]);

  const reloadSavedStory =
    useCallback(
      async (
        savedStoryId,
      ) => {
        const storyData =
          await apiRequest(
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
      },
      [
        setStoryHistoryState,
      ],
    );

  /*
   * Load an existing story.
   */
  useEffect(() => {
    if (
      !storyId ||
      storyId === "new" ||
      storyId ===
        "undefined"
    ) {
      hasLoadedStoryRef.current =
        false;

      return;
    }

    let cancelled = false;

    const loadStory =
      async () => {
        try {
          const data =
            await apiRequest(
              `/stories/${storyId}`,
            );

          if (cancelled) {
            return;
          }

          hasLoadedStoryRef.current =
            true;

          const fallbackState =
            createInitialStoryState();

          resetStoryHistory({
            storyName:
              data.name ||
              "Untitled Story",

            slides:
              data.slides
                ?.length
                ? normalizeStorySlides(
                    data,
                  )
                : fallbackState.slides,
          });
        } catch (error) {
          if (
            cancelled ||
            error?.name ===
              "AbortError"
          ) {
            return;
          }

          console.error(
            "Failed to load story:",
            error,
          );
        }
      };

    loadStory();

    return () => {
      cancelled = true;
    };
  }, [
    storyId,
    resetStoryHistory,
    createInitialStoryState,
  ]);

  const saveStory =
    useCallback(
      async () => {
        const isNew =
          storyId === "new" ||
          !storyId ||
          storyId ===
            "undefined";

        const path =
          isNew
            ? "/stories"
            : `/stories/${storyId}`;

        try {
          isSlideActionRef.current =
            true;

          const image_url =
            await makeStoryPreviewRef
              .current();

          const cleanSlides =
            serializeStorySlides(
              slides,
            );

          const result =
            await apiRequest(
              path,
              {
                method:
                  isNew
                    ? "POST"
                    : "PUT",

                body:
                  JSON.stringify(
                    {
                      name:
                        storyName,

                      slides:
                        cleanSlides,

                      image_url,
                    },
                  ),
              },
            );

          const actualStoryId =
            isNew
              ? result?.id
              : storyId;

          if (
            !actualStoryId
          ) {
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
          clearTimeout(
            pauseTimerRef.current,
          );

          pauseTimerRef.current =
            setTimeout(() => {
              isSlideActionRef.current =
                false;
            }, 300);
        }
      },
      [
        storyId,
        storyName,
        slides,
        isSlideActionRef,
        navigate,
        reloadSavedStory,
      ],
    );

  /*
   * Autosave existing stories.
   */
  useEffect(() => {
    if (
      !hasLoadedStoryRef.current
    ) {
      return;
    }

    if (
      !storyId ||
      storyId === "new" ||
      storyId ===
        "undefined"
    ) {
      return;
    }

    if (
      isSlideActionRef.current
    ) {
      return;
    }

    clearTimeout(
      autosaveTimerRef.current,
    );

    autosaveTimerRef.current =
      setTimeout(() => {
        saveStory().catch(
          (error) => {
            console.error(
              "Autosave failed:",
              error,
            );
          },
        );
      }, autosaveDelay);

    return () => {
      clearTimeout(
        autosaveTimerRef.current,
      );
    };
  }, [
    storyId,
    storyName,
    slides,
    saveStory,
    autosaveDelay,
    isSlideActionRef,
  ]);

  const publishStory =
    useCallback(
      async () => {
        try {
          /*
           * Publishing first saves the
           * latest local changes.
           */
          const actualStoryId =
            await saveStory();

          if (
            !actualStoryId
          ) {
            throw new Error(
              "The story could not be saved before publishing.",
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
            "Publish story failed:",
            error,
          );

          throw error;
        }
      },
      [
        saveStory,
        navigate,
      ],
    );

  useEffect(() => {
    return () => {
      clearTimeout(
        autosaveTimerRef.current,
      );

      clearTimeout(
        pauseTimerRef.current,
      );
    };
  }, []);

  return {
    saveStory,
    publishStory,
    reloadSavedStory,
    normalizeStorySlides,

    hasLoadedStoryRef,
  };
}

export default useStoryPersistence;