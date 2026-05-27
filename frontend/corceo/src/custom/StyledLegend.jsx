import { useState } from "react";

function StyledLegend({ payload, settings }) {
 if (!settings.showLegend) return null;

 const getStyle = () => ({
 fontWeight: settings.legendFontWeight,
 fontStyle: settings.legendFontStyle,
 fontSize: `${settings.legendFontSize}px`
 });

 const positionClasses = {
 top: "flex justify-center mb-4",
 bottom: "flex justify-center mt-4",
 left: "flex-col items-start",
 right: "flex-col items-end"
 };

 return (
 <div className={`legend-container ${positionClassessettings.legendPosition || "justify-center"}`}>
 {settings.legendTitle && (
 <div className="font-semibold text-sm mb-1 text-center" style={getStyle()}>
 {settings.legendTitle}
 </div>
 )}
 <ul className="flex flex-wrap gap-4 justify-center" style={getStyle()}>
 {payload?.map((entry, index) => (
 <li key={`item-${index}`} className="flex items-center gap-2">
 <div
 className="w-3 h-3 rounded"
 style={{ backgroundColor: entry.color }}
 />
 <span>{entry.value}</span>
 </li>
 ))}
 </ul>
 </div>
 );
}
export default StyledLegend;