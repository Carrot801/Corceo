import { useCallback } from "react";
import {
  normalizeStorySlides,
  prepareSlidesForSave,
} from "../../utils/story/storyNormalization";

const API =
  "http://localhost:5000";

export default function useStoryData({
  storyId,
  navigate,
  storyName,
  slides,
  setStoryHistoryState,
  resetStoryHistory,
  hasLoadedStoryRef,
  isSlideActionRef,
  makeStoryPreview,
}) {
  const reloadSavedStory =
    useCallback(
      async (
        savedStoryId,
        token,
      ) => {
        const response =
          await fetch(
            `${API}/stories/${savedStoryId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        const storyData =
          await response.json();

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
      },
      [setStoryHistoryState],
    );

  const loadStory =
    useCallback(async () => {
      if (
        !storyId ||
        storyId === "new" ||
        storyId === "undefined"
      ) {
        return;
      }

      const token =
        localStorage.getItem(
          "token",
        );

      const response =
        await fetch(
          `${API}/stories/${storyId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        throw new Error(
          "Network response was not ok",
        );
      }

      const data =
        await response.json();

      hasLoadedStoryRef.current =
        true;

      resetStoryHistory({
        storyName:
          data.name ||
          "Untitled Story",
        slides:
          data.slides?.length
            ? normalizeStorySlides(
                data,
              )
            : [],
      });
    }, [
      storyId,
      resetStoryHistory,
      hasLoadedStoryRef,
    ]);

  const saveStory =
    useCallback(async () => {
      const isNew =
        storyId === "new" ||
        !storyId ||
        storyId ===
          "undefined";

      const url = isNew
        ? `${API}/stories`
        : `${API}/stories/${storyId}`;

      try {
        isSlideActionRef.current =
          true;

        const token =
          localStorage.getItem(
            "token",
          );

        if (!token) {
          throw new Error(
            "No authentication token found",
          );
        }

        const image_url =
          await makeStoryPreview();

        const response =
          await fetch(url, {
            method: isNew
              ? "POST"
              : "PUT",

            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: storyName,
              slides:
                prepareSlidesForSave(
                  slides,
                ),
              image_url,
            }),
          });

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to save story",
          );
        }

        const actualStoryId =
          isNew
            ? result.id
            : storyId;

        if (!actualStoryId) {
          throw new Error(
            "The backend did not return a story ID",
          );
        }

        await reloadSavedStory(
          actualStoryId,
          token,
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
      } finally {
        setTimeout(() => {
          isSlideActionRef.current =
            false;
        }, 300);
      }
    }, [
      storyId,
      storyName,
      slides,
      makeStoryPreview,
      reloadSavedStory,
      navigate,
      hasLoadedStoryRef,
      isSlideActionRef,
    ]);

  const publishStory =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "token",
        );

      if (!token) {
        throw new Error(
          "No authentication token found",
        );
      }

      const actualStoryId =
        await saveStory();

      const response =
        await fetch(
          `${API}/stories/${actualStoryId}/publish`,
          {
            method: "PUT",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      const published =
        await response.json();

      if (!response.ok) {
        throw new Error(
          published.error ||
            "Failed to publish story",
        );
      }

      navigate(
        `/publishedStory/${actualStoryId}`,
      );
    }, [navigate, saveStory]);

  return {
    loadStory,
    saveStory,
    publishStory,
    reloadSavedStory,
  };
}
