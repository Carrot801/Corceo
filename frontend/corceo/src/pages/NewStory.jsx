import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoryChart from "../components/StoryChart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function NewStory() {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const isSlideActionRef = useRef(false);

  useEffect(() => {
    console.log("URL Param storyId is:", storyId);
  }, [storyId]);

  const [storyName, setStoryName] = useState("Untitled Story");
  const [availableProjects, setAvailableProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [slides, setSlides] = useState([
    {
      id: `temp-${Date.now()}`,
      content: [],
      description: "",
      annotations: [],
    },
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedAnnoId, setSelectedAnnoId] = useState(null);
  // Track real dimensions of canvas to prevent SVG stretching distortion
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  const canvasRef = useRef(null);
  const dragContext = useRef({ type: null, annoId: null });

  const currentSlide = slides[activeSlideIndex] || { content: [], annotations: [], description: "" };

  const hasLoadedStoryRef = useRef(false);
  const autosaveTimerRef = useRef(null);


const exportStoryPDF = async () => {
  const slideElements = document.querySelectorAll(".export-slide");

  if (!slideElements.length) return;

  const pdf = new jsPDF("landscape", "pt", [1280, 720]);

  for (let i = 0; i < slideElements.length; i++) {
    const canvas = await html2canvas(slideElements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    if (i > 0) pdf.addPage([1280, 720], "landscape");

    pdf.addImage(imgData, "PNG", 0, 0, 1280, 720);
  }

  pdf.save(`${storyName || "story"}.pdf`);
};

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
  }, [activeSlideIndex, currentSlide.content]);


  const makeStoryPreview = async () => {
  const firstSlide = document.querySelector(".export-slide");

  if (!firstSlide) return null;

  const canvas = await html2canvas(firstSlide, {
    scale: 1,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  return canvas.toDataURL("image/png");
};

  const addSlide = () =>
    setSlides([
    {
      id: `temp-${Date.now()}`,
      content: [],
      description: "",
      annotations: [],
    },
  ]);


    
   const duplicateSlide = async (index) => {
  try {
    isSlideActionRef.current = true;

    const token = localStorage.getItem("token");
    const slideId = slides[index].id;

    const res = await fetch(
      `http://localhost:5000/stories/${storyId}/slides/${slideId}/duplicate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to duplicate slide");
    }

    setSlides(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, data);
      return updated;
    });

    setActiveSlideIndex(index + 1);
    setSelectedAnnoId(null);
  } catch (err) {
    console.error("Duplicate slide error:", err);
  } finally {
    setTimeout(() => {
      isSlideActionRef.current = false;
    }, 1500);
  }
};

const deleteSlide = async (index) => {
  const slideId = slides[index].id;

  // delete unsaved temp slide locally only
  if (String(slideId).startsWith("temp-")) {
    setSlides(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length
        ? updated
        : [{ id: `temp-${Date.now()}`, content: [], description: "", annotations: [] }];
    });

    setActiveSlideIndex(current => {
      if (current === index) return Math.max(0, index - 1);
      if (current > index) return current - 1;
      return current;
    });

    setSelectedAnnoId(null);
    return;
  }

  try {
    isSlideActionRef.current = true;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/stories/${storyId}/slides/${slideId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete slide");
    }

    setSlides(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length
        ? updated
        : [{ id: `temp-${Date.now()}`, content: [], description: "", annotations: [] }];
    });

    setActiveSlideIndex(current => {
      if (current === index) return Math.max(0, index - 1);
      if (current > index) return current - 1;
      return current;
    });

    setSelectedAnnoId(null);
  } catch (err) {
    console.error("Delete slide error:", err);
  } finally {
    setTimeout(() => {
      isSlideActionRef.current = false;
    }, 500);
  }
};


  const addChartToSlide = (chartId, name) => {
      console.log("Adding chart:", chartId, name);
    setSlides(prev =>
      prev.map((slide, i) =>
        i === activeSlideIndex
          ? {
              ...slide,
              content: [
                {
                  id: Date.now(),
                  type: "chart",
                  chartId,
                  name
                }
              ]
            }
          : slide
      )
    );
    setShowPicker(false);
  };

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/projects/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAvailableProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchCharts();
  }, []);

const handleProjectClick = async (projectId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/projects/chart/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const chart = await res.json();

    console.log("chart response:", chart);

    if (!chart || !chart.id) {
      console.error("No chart id found:", chart);
      return;
    }

    addChartToSlide(chart.id, chart.name || chart.settings?.title || "Untitled chart");
    setShowPicker(false);
  } catch (err) {
    console.error("Failed to load charts", err);
  }
};

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!storyId || storyId === "new" || storyId === "undefined") return;

    fetch(`http://localhost:5000/stories/${storyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        hasLoadedStoryRef.current = true;
        setStoryName(data.name);
        if (data.slides?.length) {
          setSlides(data.slides.map(s => ({
            ...s,
            annotations: s.annotations || [],
            content: s.content || []
          })));
        } else {
          setSlides([{ id: Date.now(), content: [], description: "", annotations: [] }]);
        }
      })
      .catch(err => console.error("Fetch error:", err));
  }, [storyId]);

  useEffect(() => {
  if (!hasLoadedStoryRef.current) return;
  if (storyId === "new" || !storyId) return;
  if (isSlideActionRef.current) return;

  clearTimeout(autosaveTimerRef.current);

  autosaveTimerRef.current = setTimeout(() => {
    saveStory();
  }, 1200);

  return () => clearTimeout(autosaveTimerRef.current);
}, [storyName, slides]);
const cleanSlides = slides.map(slide => {
  const isTemp = String(slide.id).startsWith("temp-");

  return {
    ...slide,
    id: isTemp ? undefined : slide.id,
    content: slide.content || [],
    annotations: slide.annotations || [],
  };
});
  const saveStory = async () => {
    const isNew = storyId === "new" || !storyId;
    const url = isNew ? "http://localhost:5000/stories" : `http://localhost:5000/stories/${storyId}`;

    const image_url = await makeStoryPreview();
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
        name: storyName,
        slides: cleanSlides,
        image_url: image_url,
      }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      
      if (isNew && data.id) {
        navigate(`/stories/${data.id}`, { replace: true });
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const addAnnotation = () => {
    const newId = `anno-${Date.now()}`;
    const count = (currentSlide.annotations || []).length + 1;
    const newAnno = {
      id: newId,
      text: `Annotation point #${count}`,
      markerType: "dot",
      connectorType: "curved",
      x: 50,
      y: 40, 
      textX: 55,
      textY: 55,
      width: 15,
      height: 15,
      fillColor: "#3b82f6",
      radius: 6,
      labelWidth: 12,
      textSize: 0.85,
      textColor: "#1e293b",
      textBg: "white",
      fontWeight: "normal",
      textAlign: "left",
      lineWidth: 1.5,
      lineColor: "#64748b",
    };

    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, annotations: [...(s.annotations || []), newAnno]
    } : s));
    setSelectedAnnoId(newId);
  };

  const updateAnnotation = (id, key, value) => {
    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, annotations: (s.annotations || []).map(a => a.id === id ? { ...a, [key]: value } : a)
    } : s));
  };

  const removeAnnotation = (id) => {
    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, annotations: (s.annotations || []).filter(a => a.id !== id)
    } : s));
    if (selectedAnnoId === id) setSelectedAnnoId(null);
  };

const handleDragStart = (e, type, annoId, currentAnno = null) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedAnnoId(annoId);
    
    // Store initial dimensions and anchor clicks for the resize tracking calculation
    dragContext.current = { 
      type, 
      annoId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: currentAnno ? (currentAnno.width || 15) : 15,
      startHeight: currentAnno ? (currentAnno.height || 15) : 15
    };
    
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!canvasRef.current || !dragContext.current.annoId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = dragContext.current;
    
    let pctX = ((e.clientX - rect.left) / rect.width) * 100;
    let pctY = ((e.clientY - rect.top) / rect.height) * 100;
    
    pctX = Math.max(0, Math.min(100, pctX));
    pctY = Math.max(0, Math.min(100, pctY));

    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? {
      ...s, 
      annotations: (s.annotations || []).map(a => {
        if (a.id !== ctx.annoId) return a;
        
        if (ctx.type === "target") {
          return { ...a, x: pctX, y: pctY };
        } else if (ctx.type === "label") {
          return { ...a, textX: pctX, textY: pctY };
        } else if (ctx.type === "resize") {
          // Convert current mouse movement offset directly to canvas space percentages
          const deltaPctX = ((e.clientX - ctx.startX) / rect.width) * 100;
          const deltaPctY = ((e.clientY - ctx.startY) / rect.height) * 100;
          
          if (a.markerType === "circle") {
            const uniformDelta = (deltaPctX + deltaPctY) / 2; // Combines X and Y drag for a smooth diagonal scale
            const newSize = Math.max(3, ctx.startWidth + uniformDelta);
            return {
              ...a,
              width: newSize,
              height: newSize
            };
          }
          return {
            ...a,
            width: Math.max(3, ctx.startWidth + deltaPctX),
            height: Math.max(3, ctx.startHeight + deltaPctY)
          };
        }
        return a;
      })
    } : s));
  };
  const publishStory = async () => {
  try {
    const token = localStorage.getItem("token");

    // Save current story first
    const saveUrl =
      storyId === "new" || !storyId
        ? "http://localhost:5000/stories"
        : `http://localhost:5000/stories/${storyId}`;

    const saveRes = await fetch(saveUrl, {
      method:
        storyId === "new" || !storyId
          ? "POST"
          : "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: storyName,
        slides,
      }),
    });

    const saved = await saveRes.json();

    if (!saveRes.ok) {
      alert("Failed to save story");
      return;
    }

    const actualStoryId =
      saved.id || storyId;

    // Publish story
    const publishRes = await fetch(
      `http://localhost:5000/stories/${actualStoryId}/publish`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const published =
      await publishRes.json();

    if (!publishRes.ok) {
      alert("Failed to publish story");
      return;
    }

    navigate(
      `/publishedStory/${actualStoryId}`
    );

  } catch (err) {
    console.error(err);
  }
};

  const handleDragEnd = () => {
    dragContext.current = { type: null, annoId: null };
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
  };

  // Convert responsive percentages back into strict uniform pixel targets
  // Convert responsive percentages into strict uniform pixel targets anchored to shape borders
  const renderConnectorPath = (anno) => {
    if (anno.connectorType === "none" || !canvasDimensions.width) return null;

    const x1 = (anno.textX / 100) * canvasDimensions.width;
    const y1 = (anno.textY / 100) * canvasDimensions.height;
    
    // Change these to 'let' so we can recalculate their boundary positions dynamically
    let x2 = (anno.x / 100) * canvasDimensions.width;
    let y2 = (anno.y / 100) * canvasDimensions.height;

    // DYNAMIC BORDER ANCHORING ENGINE
    if (anno.markerType === "square" || anno.markerType === "circle") {
      const boxW = ((anno.width || 15) / 100) * canvasDimensions.width;
      // If it's a circle, its pixel height matches its pixel width due to aspect-ratio rules
      const boxH = anno.markerType === "circle" ? boxW : ((anno.height || 15) / 100) * canvasDimensions.height;
      
      // 1. Pinpoint the exact center coordinates of the shape framework
      const shapeCenterX = x2 + boxW / 2;
      const shapeCenterY = y2 + boxH / 2;
      
      // 2. Formulate direction vectors from the floating text label to the shape center
      const dx = shapeCenterX - x1;
      const dy = shapeCenterY - y1;
      const distance = Math.hypot(dx, dy) || 1;
      
      // 3. Compute precise border intersection padding offset based on approach angle
      let edgeOffset = boxW / 2; 
      
      if (anno.markerType === "square") {
        const absCos = Math.abs(dx / distance);
        const absSin = Math.abs(dy / distance);
        // Angular slope check determines if arrow hits the left/right or top/bottom walls
        if (boxW * absSin <= boxH * absCos) {
          edgeOffset = (boxW / 2) / (absCos || 1);
        } else {
          edgeOffset = (boxH / 2) / (absSin || 1);
        }
      }
      
      // 4. Override line destination to snap flush against the outer wall perimeter
      x2 = shapeCenterX - (dx / distance) * edgeOffset;
      y2 = shapeCenterY - (dy / distance) * edgeOffset;
    }
    else if (anno.markerType === "dot") {
      // Calculate the dot's real pixel radius based on your rendering layout
      const radiusPx = (anno.radius || 6) * 1.25;
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.hypot(dx, dy) || 1;
      
      // Pull the arrow destination back to the outer rim of the dot (plus 3px breathing room)
      x2 = x2 - (dx / distance) * (radiusPx + 3);
      y2 = y2 - (dy / distance) * (radiusPx + 3);
    }

    const strokeColor = anno.lineColor || "#64748b";
    const strokeW = anno.lineWidth || 1.5;

    if (anno.connectorType === "straight") {
      return (
        <line 
          key={`line-${anno.id}`}
          x1={x1} 
          y1={y1} 
          x2={x2} 
          y2={y2} 
          stroke={strokeColor} 
          strokeWidth={strokeW} 
          markerEnd={`url(#arrow-${anno.id})`} 
        />
      );
    }
    
    if (anno.connectorType === "curved") {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const h = Math.hypot(dx, dy);
      
      const bendFactor = 0.2; 
      const cx = (x1 + x2) / 2 - (dy / h) * (h * bendFactor);
      const cy = (y1 + y2) / 2 + (dx / h) * (h * bendFactor);

      return (
        <path 
          key={`angle-${anno.id}`}
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} 
          fill="none" stroke={strokeColor} strokeWidth={strokeW} 
          markerEnd={`url(#arrow-${anno.id})`} 
        />
      );
    }
    
    if (anno.connectorType === "angled") {
      return (
        <path 
          d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`} 
          fill="none" stroke={strokeColor} strokeWidth={strokeW} 
          markerEnd={`url(#arrow-${anno.id})`} 
        />
      );
    }
    return null;
  };
  

  return (
    <div className="app-page flex h-screen font-sans select-none">
      
      {/* LEFT SIDEBAR: Slide Deck */}
      <div className="app-surface app-border w-72 border-r flex flex-col p-4 gap-4 shrink-0">
        <div className="flex justify-between items-center gap-2">
          <input 
            type="text" 
            value={storyName}
            onChange={(e) => setStoryName(e.target.value)}
            className="app-text bg-transparent text-xl font-bold border-b border-transparent hover:border-[rgb(var(--color-border-strong))] focus:border-[rgb(var(--color-highlight))] focus:outline-none p-1 w-2/3"
          />
          
          <button
            onClick={exportStoryPDF}
            className="btn-secondary px-4 py-2 text-sm shadow-sm"
          >
            Export
          </button>
          {/* <button
            onClick={publishStory}
            className="btn-secondary px-4 py-2 text-sm shadow-sm"
          >
            Publish
          </button> */}
          <button 
            onClick={saveStory}
            className="btn-primary px-4 py-2 text-sm shadow-sm"
          >
            Save
          </button>
        </div>

        <button onClick={() => navigate(-1)} className="app-text-muted hover:text-[rgb(var(--color-text))] text-sm text-left transition-colors">&larr; Back to projects</button>
        <hr className="app-border" />


        <div className="flex flex-col w-full justify-between items-center gap-2 overflow-y-scroll">

          {slides.map((s, i) => (
            <div
              key={s.id}
              onClick={() => setActiveSlideIndex(i)}
              className={`relative shrink-0 group my-2 w-[97%] h-36 border rounded cursor-pointer flex items-center justify-center font-semibold app-text-muted ${
                activeSlideIndex === i
                  ? "ring-2 ring-[rgb(var(--color-highlight))] bg-[rgb(var(--color-primary-soft))] border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
                  : "app-surface-secondary app-text-muted hover:border-[rgb(var(--color-border-strong))]"
              }`}
            >
              <span>Slide {i + 1}</span>

              <div
                className={`absolute top-2 right-2 flex gap-1 transition-opacity ${
                  activeSlideIndex === i
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => duplicateSlide(i)}
                  title="Duplicate slide"
                  className="app-surface app-border app-text-secondary w-7 h-7 rounded border shadow-sm hover:text-[rgb(var(--color-primary))] hover:border-[rgb(var(--color-primary))]"
                >
                  ⧉
                </button>

                <button
                  onClick={() => deleteSlide(i)}
                  title="Delete slide"
                  className="app-surface app-border app-text-secondary w-7 h-7 rounded border shadow-sm hover:text-[rgb(var(--color-danger))] hover:border-[rgb(var(--color-danger))]"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={addSlide} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors">+ Add Slide</button>
      </div>

      {/* CENTRAL MAIN CANVAS */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden">
        <div className="story-slide app-card w-full max-w-4xl shadow-xl h-[620px] rounded-2xl p-6 flex flex-col gap-4 relative">          
          <input
            type="text"
            placeholder="Enter slide title or description narrative..."
            value={currentSlide.description || ""}
            onChange={(e) => {
              const updatedSlides = [...slides];
              updatedSlides[activeSlideIndex].description = e.target.value;
              setSlides(updatedSlides);
            }}
            className="app-text bg-transparent w-full text-2xl font-bold border-b border-transparent hover:border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-highlight))] outline-none pb-2 transition-colors"
          />

          {/* Core Interactive Bounding Canvas Wrapper */}
          <div 
            ref={canvasRef}
            className="app-surface-secondary app-border flex-1 border rounded-xl relative group"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedAnnoId(null); }}
          >
            {/* Chart Renderer Layer */}
            <div className="w-full h-full pointer-events-auto">
              {currentSlide.content.map((item) => {
                console.log("Rendering StoryChart with id:", item.chartId);

                return (
                  <div key={item.id} className="w-full h-full relative">
                    <StoryChart chartId={item.chartId} />
                  </div>
                );
              })} 

              {currentSlide.content.length === 0 && (
                <button 
                  onClick={() => setShowPicker(true)} 
                  className="app-text-muted w-full h-full border-dashed border-2 border-[rgb(var(--color-border-strong))] flex flex-col items-center justify-center hover:bg-[rgb(var(--color-surface-hover))] rounded-lg gap-2 transition-all"
                >
                  <span className="text-2xl">📊</span>
                  <span className="text-xs font-semibold">Connect Component Data Map</span>
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
                      fontSize: `${anno.textSize || 0.85}rem`,
                      color: anno.textColor || "#1e293b",
                      fontWeight: anno.fontWeight || "normal",
                      textAlign: anno.textAlign || "left",
                      backgroundColor: anno.textBg === "transparent" ? "transparent" : (anno.textBg || "#ffffff"),
                      border: anno.textBg === "outline" ? `1px solid ${anno.textColor}40` : (isSelected ? "1px solid #3b82f6" : "none"),
                      padding: anno.textBg !== "transparent" ? "5px 10px" : "2px"
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

      {/* RIGHT SIDEBAR: Flourish-Style Option Matrix Panels */}
      <div className="app-surface app-border w-80 border-l flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
        
        <div className="flex flex-col gap-2">
          <h3 className="app-text-muted text-xs font-bold uppercase tracking-wider">Annotations Matrix</h3>
          <button 
            onClick={addAnnotation}
            className="btn-secondary w-full py-2 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>➕</span> Add Annotation Point
          </button>
        </div>

        <hr className="app-border" />

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          <h4 className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Points on this slide</h4>
          
          {(currentSlide.annotations || []).length === 0 ? (
            <div className="app-text-muted text-center text-xs italic py-6">No annotations on this slide view.</div>
          ) : (
            (currentSlide.annotations || []).map((anno, listIdx) => {
              const isEditingThis = selectedAnnoId === anno.id;
              return (
                <div 
                  key={anno.id} 
                  className={`app-card rounded-xl transition-all overflow-hidden ${
                    isEditingThis ? 'border-[rgb(var(--color-primary))] shadow-md ring-1 ring-[rgb(var(--color-highlight))]' : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border-strong))]'
                  }`}
                >
                  {/* Summary Bar Card Header Trigger */}
                  <div 
                    onClick={() => setSelectedAnnoId(anno.id)}
                    className={`p-3 cursor-pointer flex items-center justify-between text-xs font-bold transition-colors ${
                      isEditingThis ? 'bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]' : 'app-text-secondary hover:bg-[rgb(var(--color-surface-hover))]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white shrink-0" style={{ backgroundColor: anno.fillColor }}>
                        {listIdx + 1}
                      </span>
                      <span className="truncate font-medium">{anno.text || "Untitled point note..."}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeAnnotation(anno.id); }} className="app-text-muted hover:text-[rgb(var(--color-danger))] font-bold px-1">✕</button>
                  </div>

                  {/* ACTIVE PROPERTIES NESTED SUBPANEL */}
                  {isEditingThis && (
                    <div className="app-surface-secondary app-border p-3 border-t flex flex-col gap-4 text-xs max-h-[400px] overflow-y-auto">
                      
                      {/* Text Entry Field */}
                      <div className="flex flex-col gap-1">
                        <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Annotation Text</label>
                        <textarea 
                          value={anno.text}
                          onChange={(e) => updateAnnotation(anno.id, "text", e.target.value)}
                          rows={2}
                          className="app-input w-full rounded-lg p-2 text-xs resize-none leading-normal font-medium"
                        />
                      </div>

                      {/* Marker Types Form Matrix */}
                      <div className="flex flex-col gap-1">
                        <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Marker Type</label>
                        <div className="app-surface-secondary app-text-secondary grid grid-cols-3 gap-1 p-1 rounded-md text-center font-semibold">
                          {[
                            { id: "none", label: "None" },
                            { id: "dot", label: "Dot •" },
                            { id: "circle", label: "Circle ◯" },
                            { id: "square", label: "Square ▢" }
                          ].map(m => (
                            <button 
                              key={m.id}
                              onClick={() => updateAnnotation(anno.id, "markerType", m.id)}
                              className={`py-1 rounded text-[10px] transition-all ${anno.markerType === m.id ? 'app-surface shadow-xs font-bold text-[rgb(var(--color-primary))]' : 'hover:text-[rgb(var(--color-text))]'}`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Connector Vector Options */}
                      <div className="flex flex-col gap-1">
                        <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Connector Type</label>
                        <div className="app-surface-secondary app-text-secondary grid grid-cols-4 gap-1 p-1 rounded-md text-center font-semibold">
                          {[
                            { id: "none", label: "None" },
                            { id: "curved", label: "Arc" },
                            { id: "straight", label: "Line" },
                            { id: "angled", label: "Elbow" }
                          ].map(c => (
                            <button 
                              key={c.id}
                              onClick={() => updateAnnotation(anno.id, "connectorType", c.id)}
                              className={`py-1 rounded text-[9px] transition-all truncate px-0.5 ${anno.connectorType === c.id ? 'app-surface shadow-xs font-bold text-[rgb(var(--color-primary))]' : 'hover:text-[rgb(var(--color-text))]'}`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accent / Marker Sizing metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Fill Color</label>
                          <input 
                            type="color" 
                            value={anno.fillColor || "#3b82f6"} 
                            onChange={(e) => updateAnnotation(anno.id, "fillColor", e.target.value)}
                            className="app-surface app-border w-full h-8 border rounded-lg p-0.5 cursor-pointer"
                          />
                        </div>

                        
                        {anno.markerType === "dot" && (
                        <div className="flex flex-col gap-1">
                          <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Radius Size</label>
                          <input 
                            type="number" step="1" min="3" max="20"
                            value={anno.radius || 6} 
                            onChange={(e) => updateAnnotation(anno.id, "radius", parseFloat(e.target.value) || 6)}
                            className="app-input w-full h-8 rounded-lg px-2 text-center"
                          />
                        </div>
                        )}
                        
                      </div>

                      {/* Marker Center Text Label Input */}
                      {anno.markerType !== "none" && (
                        <div className="flex flex-col gap-1">
                          <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">Marker Center Label</label>
                          <input 
                            type="text" maxLength={2} placeholder="e.g. 1"
                            value={anno.markerLabel || ""} 
                            onChange={(e) => updateAnnotation(anno.id, "markerLabel", e.target.value)}
                            className="app-input w-full h-8 rounded-lg px-2"
                          />
                        </div>
                      )}

                      {/* Text styling & layout parameters wrapper */}
                      <div className="app-border border-t pt-3 flex flex-col gap-3">
                        <span className="app-text-muted text-[10px] font-bold uppercase tracking-wider block mb-1">Text and Connector Styles</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Weight</label>
                            <div className="app-surface-secondary flex p-0.5 rounded-md mt-1">
                              <button 
                                onClick={() => updateAnnotation(anno.id, "fontWeight", "normal")}
                                className={`flex-1 py-1 rounded text-[10px] font-medium ${anno.fontWeight !== "bold" ? "app-surface shadow-xs text-[rgb(var(--color-primary))] font-bold" : "app-text-secondary"}`}
                              >
                                Normal
                              </button>
                              <button 
                                onClick={() => updateAnnotation(anno.id, "fontWeight", "bold")}
                                className={`flex-1 py-1 rounded text-[10px] font-medium ${anno.fontWeight === "bold" ? "app-surface shadow-xs text-[rgb(var(--color-primary))] font-bold" : "app-text-secondary"}`}
                              >
                                Bold
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Text Size (rem)</label>
                            <input 
                              type="number" step="0.05" min="0.5" max="2"
                              value={anno.textSize || 0.85}
                              onChange={(e) => updateAnnotation(anno.id, "textSize", parseFloat(e.target.value) || 0.85)}
                              className="app-input w-full h-7 rounded-md mt-1 text-center px-2 py-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Text Color</label>
                            <input 
                              type="color" value={anno.textColor || "#1e293b"}
                              onChange={(e) => updateAnnotation(anno.id, "textColor", e.target.value)}
                              className="app-surface app-border w-full h-7 border rounded-md p-0.5 mt-1 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Max Width (rem)</label>
                            <input 
                              type="number" min="5" max="30"
                              value={anno.labelWidth || 12}
                              onChange={(e) => updateAnnotation(anno.id, "labelWidth", parseInt(e.target.value) || 12)}
                              className="app-input w-full h-7 rounded-md mt-1 text-center px-2 py-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Background</label>
                            <select 
                              value={anno.textBg || "white"} 
                              onChange={(e) => updateAnnotation(anno.id, "textBg", e.target.value)}
                              className="app-input w-full h-7 rounded-md mt-1 text-[11px] px-1 py-1"
                            >
                              <option value="transparent">Transparent</option>
                              <option value="#ffffff">Solid White</option>
                              <option value="#f1f5f9">Light Gray</option>
                              <option value="outline">Outline Border</option>
                            </select>
                          </div>
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Alignment</label>
                            <select 
                              value={anno.textAlign || "left"} 
                              onChange={(e) => updateAnnotation(anno.id, "textAlign", e.target.value)}
                              className="app-input w-full h-7 rounded-md mt-1 text-[11px] px-1 py-1"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Direct Line / Arrow style toggles */}
                      <div className="app-border border-t pt-3 flex flex-col gap-2">
                        <span className="app-text-muted text-[10px] font-bold uppercase tracking-wider block mb-1">Line Interface Properties</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Line Color</label>
                            <input 
                              type="color" value={anno.lineColor || "#64748b"}
                              onChange={(e) => updateAnnotation(anno.id, "lineColor", e.target.value)}
                              className="app-surface app-border w-full h-7 border rounded-md p-0.5 mt-1 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="app-text-secondary text-[10px] font-semibold">Thickness (px)</label>
                            <input 
                              type="number" step="0.5" min="0.5" max="8"
                              value={anno.lineWidth || 1.5}
                              onChange={(e) => updateAnnotation(anno.id, "lineWidth", parseFloat(e.target.value) || 1.5)}
                              className="app-input w-full h-7 rounded-md mt-1 text-center px-2 py-1"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="fixed left-[-9999px] top-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="export-slide bg-white"
            style={{
              width: "1280px",
              height: "720px",
              padding: "48px",
              boxSizing: "border-box",
            }}
          >
            <h1 style={{ fontSize: "34px", fontWeight: "700", marginBottom: "24px" }}>
              {slide.description || `Slide ${index + 1}`}
            </h1>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "560px",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                background: "#f8fafc",
                overflow: "hidden",
              }}
            >
              {slide.content.map((item) => (
                <div key={item.id} style={{ width: "100%", height: "100%" }}>
                  <StoryChart chartId={item.chartId} />
                </div>
              ))}

              {slide.annotations?.map((anno) => (
                <div
                  key={anno.id}
                  style={{
                    position: "absolute",
                    left: `${anno.textX}%`,
                    top: `${anno.textY}%`,
                    transform: "translate(-50%, -50%)",
                    background: anno.textBg || "white",
                    color: anno.textColor || "#1e293b",
                    fontSize: `${anno.textSize || 0.85}rem`,
                    fontWeight: anno.fontWeight || "normal",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    maxWidth: `${anno.labelWidth || 12}rem`,
                  }}
                >
                  {anno.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* SELECTION MODAL */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="app-card w-full max-w-xl h-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="app-border flex justify-between items-center px-5 py-4 border-b">
              <h2 className="app-text text-base font-bold">Select Project Element Block</h2>
              <button onClick={() => setShowPicker(false)} className="app-text-muted hover:text-[rgb(var(--color-text))] font-bold">✕</button>
            </div>
            <div className="app-surface-secondary app-border p-3 border-b">
              <input 
                type="text" 
                placeholder="Search matching visualization layouts..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="app-input w-full rounded-xl p-2.5 text-xs" 
              />
            </div>
            <div className="app-surface-secondary flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-4">
                {availableProjects
                  .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
                  .map((project) => (
                    <div 
                      key={project.id} 
                      onClick={() => handleProjectClick(project.id)} 
                      className="app-card hover:border-[rgb(var(--color-primary))] rounded-xl p-3 cursor-pointer shadow-2xs transition-all items-center gap-3 group"
                    >
                     <div className="app-surface-secondary app-border flex-1 border-b flex items-center justify-center"> 
                      {project.image_url ? 
                      ( <img src={project.image_url} 
                      alt={project.name} 
                      className="w-full h-24 " /> ) 
                      : ( 
                      <div className="app-text-muted w-full h-24 flex items-center justify-center"> 📊 
                      </div> 
                    )} </div>                   
                      <div className="app-text-secondary font-semibold text-xs truncate">
                        {project.name}
                        </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default NewStory;