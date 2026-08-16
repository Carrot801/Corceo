
function StoryAnnotationsSidebar({
  currentSlide,addAnnotation,selectedAnnoId,setSelectedAnnoId,removeAnnotation,updateAnnotation
}) {
  return (
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
                                  className={`py-1 rounded text-[10px] transition-all truncate px-0.5 ${anno.connectorType === c.id ? 'app-surface shadow-xs font-bold text-[rgb(var(--color-primary))]' : 'hover:text-[rgb(var(--color-text))]'}`}
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
  );
}

export default StoryAnnotationsSidebar;
