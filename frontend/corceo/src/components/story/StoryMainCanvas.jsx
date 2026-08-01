import React from "react";
import StoryChart from "../StoryChart";

function StoryMainCanvas({
  activeSlideIndex,currentSlide,setSlides,slides,canvasRef,selectedChartId,selectedAnnoId,setSelectedChartId,setSelectedAnnoId,startChartInteraction,duplicateChartItem,deleteChartItem,sendChartToBack,setShowPicker,canvasDimensions,renderConnectorPath,handleDragStart,setActiveSlideIndex
}) {
  return (
          <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden">
            <div className="story-slide app-card w-full max-w-4xl shadow-xl h-[620px] rounded-2xl p-6 flex flex-col gap-4 relative">          
              <input
      type="text"
      placeholder={`Slide ${activeSlideIndex + 1}`}
      value={currentSlide.description || ""}
      onChange={(e) => {
        const newTitle = e.target.value;

        setSlides((previousSlides) =>
          previousSlides.map((slide, index) =>
            index === activeSlideIndex
              ? {
                  ...slide,
                  description: newTitle,
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

              {/* Core Interactive Bounding Canvas Wrapper */}
              <div 
                ref={canvasRef}
                className="app-surface-secondary app-border flex-1 border rounded-xl relative group"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedAnnoId(null);
                    setSelectedChartId(null);
                  }
                }}
              >
                {/* Chart Renderer Layer */}
                <div className="absolute inset-0 z-[5] overflow-hidden rounded-xl">
                  {(currentSlide.content || []).map((item) => {
                    const isSelected = selectedChartId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`absolute group rounded-xl transition-shadow ${
                          isSelected
                            ? "ring-2 ring-[rgb(var(--color-primary))] shadow-xl"
                            : "hover:ring-1 hover:ring-[rgb(var(--color-border-strong))]"
                        }`}
                        style={{
                          left: `${item.x ?? 5}%`,
                          top: `${item.y ?? 5}%`,
                          width: `${item.width ?? 48}%`,
                          height: `${item.height ?? 45}%`,
                          zIndex: item.zIndex ?? 1,
                        }}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          setSelectedChartId(item.id);
                          setSelectedAnnoId(null);
                        }}
                      >
                        <div className="app-card relative h-full w-full overflow-hidden rounded-sm">
                          <div
                            className={`absolute left-0 right-0 top-0 z-20 flex h-9 items-center justify-between border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/90 px-2 backdrop-blur-sm transition-opacity ${
                              isSelected
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <button
                              type="button"
                              className="app-text-secondary min-w-0 flex-1 cursor-move truncate text-left text-[11px] font-semibold"
                              title="Drag chart"
                              onMouseDown={(event) =>
                                startChartInteraction(event, "move", item)
                              }
                            >
                              ⋮⋮ {item.name || "Chart"}
                            </button>

                            <div className="ml-2 flex shrink-0 gap-1">
                              <button
                                type="button"
                                title="Send backward"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  sendChartToBack(item.id);
                                }}
                                className="app-icon-button h-6 w-6 rounded text-xs"
                              >
                                ↓
                              </button>

                              <button
                                type="button"
                                title="Duplicate chart"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  duplicateChartItem(item.id);
                                }}
                                className="app-icon-button h-6 w-6 rounded text-xs"
                              >
                                ⧉
                              </button>

                              <button
                                type="button"
                                title="Delete chart"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteChartItem(item.id);
                                }}
                                className="app-icon-button h-6 w-6 rounded text-xs text-[rgb(var(--color-danger))]"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div className="h-full w-full bg-white">
                            <div className="w-full h-full">
                              <StoryChart 
                              chartId={item.chartId}
                              storyMode 
                              />
                            </div>
                          </div>

                          {isSelected && (
                            <>
                              <div
                                onMouseDown={(event) =>
                                  startChartInteraction(event, "top", item)
                                }
                                className="absolute left-3 right-3 top-0 z-30 h-2 -translate-y-1/2 cursor-n-resize"
                              />
                              <div
                                onMouseDown={(event) =>
                                  startChartInteraction(event, "bottom", item)
                                }
                                className="absolute bottom-0 left-3 right-3 z-30 h-2 translate-y-1/2 cursor-s-resize"
                              />
                              <div
                                onMouseDown={(event) =>
                                  startChartInteraction(event, "left", item)
                                }
                                className="absolute bottom-3 left-0 top-3 z-30 w-2 -translate-x-1/2 cursor-w-resize"
                              />
                              <div
                                onMouseDown={(event) =>
                                  startChartInteraction(event, "right", item)
                                }
                                className="absolute bottom-3 right-0 top-3 z-30 w-2 translate-x-1/2 cursor-e-resize"
                              />

                              {[
                                ["top-left", "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize"],
                                ["top-right", "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize"],
                                ["bottom-left", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize"],
                                ["bottom-right", "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize"],
                              ].map(([mode, position]) => (
                                <button
                                  key={mode}
                                  type="button"
                                  aria-label={`Resize chart from ${mode}`}
                                  onMouseDown={(event) =>
                                    startChartInteraction(event, mode, item)
                                  }
                                  className={`absolute z-40 h-3 w-3 rounded-sm border border-[rgb(var(--color-surface))] bg-[rgb(var(--color-primary))] shadow ${position}`}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {(currentSlide.content || []).length === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="app-text-muted flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[rgb(var(--color-border-strong))] transition-all hover:bg-[rgb(var(--color-surface-hover))]"
                    >
                      <span className="text-2xl">📊</span>
                      <span className="text-xs font-semibold">
                        Add your first chart
                      </span>
                    </button>
                  )}

                  {(currentSlide.content || []).length > 0 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowPicker(true);
                      }}
                      className="btn-primary absolute bottom-3 right-3 z-[100] rounded-lg px-3 py-2 text-xs shadow-lg"
                    >
                      + Add chart
                    </button>
                  )}
                </div>

                {/* Sharp SVG Connector Path Layer - Absolute dimensions prevent stretching distortion */}
                <svg 
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
                >
                  <defs>
                    {(currentSlide.annotations || []).map((anno) => (
                      <marker 
                        key={anno.id}
                        id={`arrow-${anno.id}`} 
                        viewBox="0 0 10 10" 
                        refX="6" refY="5" 
                        markerWidth="7" markerHeight="7" 
                        orient="auto-start-reverse"
                      >
                        {/* Sleek, razor-thin sharp triangle matching target UI style */}
                        <path d="M 0 2 L 8 5 L 0 8 z" fill={anno.lineColor || "#64748b"} />
                      </marker>
                    ))}
                  </defs>
                  {(currentSlide.annotations || []).map((anno) => renderConnectorPath(anno))}
                </svg>

                {/* DOM Element Layer */}
                {(currentSlide.annotations || []).map((anno, listIdx) => {
                  const isSelected = selectedAnnoId === anno.id;
                  return (
                    <div key={anno.id} className="absolute inset-0 pointer-events-none z-20">
                  
                      {/* Context Circle Highlight Ring */}
                      {/* Bounding Box Resizable Shape Component Wrapper */}
                      {anno.markerType !== "none" && (
                        <div
                          className={`absolute pointer-events-auto transition-shadow ${
                            isSelected ? 'z-40' : 'z-30'
                          }`}
                          style={{
                            left: `${anno.x}%`,
                            top: `${anno.y}%`,
                            // If it's a dot, use pixels. Otherwise use percentage width.
                            width: anno.markerType === "dot" ? `${(anno.radius || 6) * 2.5}px` : `${anno.width || 15}%`,
                        
                            // FIX: For circles, let CSS calculate height automatically based on width to stay perfectly round
                            height: anno.markerType === "dot" 
                              ? `${(anno.radius || 6) * 2.5}px` 
                              : anno.markerType === "circle" 
                                ? "auto" 
                                : `${anno.height || 15}%`,
                        
                            // FORCE 1:1 aspect ratio strictly for circles
                            aspectRatio: anno.markerType === "circle" ? "1 / 1" : "auto",
                        
                            transform: anno.markerType === "dot" ? 'translate(-50%, -50%)' : 'none',
                          }}
                        >
                          {/* 1. If it's a regular standalone Dot handle */}
                          {anno.markerType === "dot" && (
                            <div 
                              onMouseDown={(e) => handleDragStart(e, "target", anno.id)}
                              onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                              className={`w-full h-full rounded-full cursor-move shadow-md border flex items-center justify-center text-[9px] font-bold text-white transition-transform ${
                                isSelected ? 'ring-4 ring-blue-500/20 border-blue-600' : 'border-white hover:scale-110'
                              }`}
                              style={{ backgroundColor: anno.fillColor }}
                            >
                            </div>
                          )}

                          {/* 2. If it's an expandable visual Circle Ring */}
                          {anno.markerType === "circle" && (
                            <div 
                              onMouseDown={(e) => { if(e.target === e.currentTarget) handleDragStart(e, "target", anno.id) }}
                              onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                              className={`w-full h-full border-2 border-dashed rounded-full cursor-move relative transition-all ${
                                isSelected ? 'border-solid border-blue-500 shadow-xs' : 'hover:border-gray-400'
                              }`}
                              style={{ borderColor: anno.fillColor, backgroundColor: `${anno.fillColor}08` }}
                            >
                            </div>
                          )}

                          {/* 3. If it's an expandable visual Square Block */}
                          {anno.markerType === "square" && (
                            <div 
                              onMouseDown={(e) => { if(e.target === e.currentTarget) handleDragStart(e, "target", anno.id) }}
                              onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                              className={`w-full h-full border-2 border-dashed rounded-lg cursor-move relative transition-all ${
                                isSelected ? 'border-solid border-blue-500 shadow-xs' : 'hover:border-gray-400'
                              }`}
                              style={{ borderColor: anno.fillColor, backgroundColor: `${anno.fillColor}05` }}
                            >
                            </div>
                          )}

                          {/* Dynamic Handle Anchor Link ("Punk Circle") - Displayed only on selection for custom shapes */}
                          {isSelected && anno.markerType !== "dot" && (
                            <div 
                              onMouseDown={(e) => handleDragStart(e, "resize", anno.id, anno)}
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[rgb(var(--color-primary))] border-2 border-[rgb(var(--color-surface))] rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize shadow-md hover:scale-125 transition-transform z-50"
                              title="Drag to resize shape frame layout"
                            />
                          )}
                        </div>
                      )}

                      {/* Floating Content Label Text Box */}
                      <div 
                        onMouseDown={(e) => handleDragStart(e, "label", anno.id)}
                        onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                        className={`absolute p-2 pointer-events-auto cursor-move shadow-xs select-text rounded border border-transparent transition-all ${
                          isSelected ? 'ring-2 ring-blue-500 shadow-lg rounded-lg z-50 bg-white border-blue-100' : ''
                        }`}
                        style={{
                          left: `${anno.textX}%`,
                          top: `${anno.textY}%`,
                          transform: 'translate(-50%, -50%)',
                          maxWidth: `${anno.labelWidth || 12}rem`,
                          padding: "6px 9px",
                          fontSize: `${anno.textSize || 0.85}rem`,
                          color: anno.textColor || "#1e293b",
                          fontWeight: anno.fontWeight || "normal",
                          textAlign: anno.textAlign || "left",
                          backgroundColor: anno.textBg === "transparent" ? "transparent" : (anno.textBg || "#ffffff"),
                          border: anno.textBg === "outline" ? `1px solid ${anno.textColor}40` : (isSelected ? "1px solid #3b82f6" : "none"),
                        }}
                      >
                        <div className="break-words leading-snug pointer-events-none">
                          {anno.text || "Comment text..."}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* LOWER CONTROLS */}
              <div className="app-border flex justify-between items-center pt-3 border-t mt-auto">
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setActiveSlideIndex(Math.max(0, activeSlideIndex - 1)); setSelectedAnnoId(null); }}
                    disabled={activeSlideIndex === 0}
                    className="btn-secondary px-5 py-2 text-sm rounded-xl disabled:opacity-40"
                  >
                    &larr; Previous
                  </button>
                  <button 
                    onClick={() => { setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1)); setSelectedAnnoId(null); }}
                    disabled={activeSlideIndex === slides.length - 1}
                    className="btn-primary px-5 py-2 text-sm rounded-xl disabled:opacity-40"
                  >
                    Next &rarr;
                  </button>
                </div>
                <span className="app-text-muted text-xs font-bold uppercase tracking-wider">
                  Slide {activeSlideIndex + 1} / {slides.length}
                </span>
              </div>
            </div>
          </div>

  );
}

export default StoryMainCanvas;
