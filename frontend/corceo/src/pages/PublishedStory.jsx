import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StoryChart from "../components/StoryChart";
import { apiRequest } from "../api/client";

function PublishedStory() {
  const { storyId } = useParams();

  const [story, setStory] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    const loadStory = async () => {
      try {
        const data = await apiRequest(
          `/stories/public/${storyId}`
        );

        setStory(data);
      } catch (err) {
        console.error("Published story load failed:", err);
      }
    };

    loadStory();
  }, [storyId]);

  if (!story) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading story...
      </div>
    );
  }

  const slides = story.slides || [];
  const currentSlide = slides[activeSlideIndex];

  const goPrev = () => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setActiveSlideIndex((prev) =>
      Math.min(slides.length - 1, prev + 1)
    );
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl h-[720px] bg-white rounded-2xl shadow-xl p-8 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">
          {currentSlide?.description || story.name}
        </h1>

        <div className="relative flex-1 border rounded-xl bg-slate-50 overflow-hidden">
          {currentSlide?.content?.map((item) => (
            <div key={item.id} className="w-full h-full">
              <StoryChart 
              chartId={item.chartId}
              storyMode />
            </div>
          ))}

          {currentSlide?.annotations?.map((anno) => (
            <div
              key={anno.id}
              className="absolute"
              style={{
                left: `${anno.textX}%`,
                top: `${anno.textY}%`,
                transform: "translate(-50%, -50%)",
                background:
                  anno.textBg === "transparent"
                    ? "transparent"
                    : anno.textBg || "white",
                color: anno.textColor || "#1e293b",
                fontSize: `${anno.textSize || 0.85}rem`,
                fontWeight: anno.fontWeight || "normal",
                textAlign: anno.textAlign || "left",
                padding: "6px 10px",
                borderRadius: "8px",
                maxWidth: `${anno.labelWidth || 12}rem`,
              }}
            >
              {anno.text}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goPrev}
            disabled={activeSlideIndex === 0}
            className="px-5 py-2 bg-gray-200 rounded-lg disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-500">
            Slide {activeSlideIndex + 1} / {slides.length}
          </div>

          <button
            onClick={goNext}
            disabled={activeSlideIndex === slides.length - 1}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishedStory;