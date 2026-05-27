function ChartDescription({ settings, columns, chartConfig }) {
 if (!settings.description &&!settings.descriptionAttributes.length) return null;

 const getAttributeValue = (attribute) => {
 if (!data ||!data.length) return "-";
 const values = data.map(row => rowattribute);
 const numericValues = values.filter(v =>!isNaN(parseFloat(v))).map(Number);

 if (numericValues.length === values.length && numericValues.length > 0) {
 const sum = numericValues.reduce((a, b) => a + b, 0);
 const avg = sum / numericValues.length;
 return `Sum: ${sum.toFixed(2)}, Avg: ${avg.toFixed(2)}, Count: ${numericValues.length}`;
 }
 return `${values.length} values`;
 };

 return (
 <div className="chart-description p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
 {settings.description && (
 <div className="mb-2">
 <span className="font-semibold text-sm">Description:</span>
 <p className="text-sm text-gray-600 mt-1">{settings.description}</p>
 </div>
 )}

 {settings.descriptionAttributes.length > 0 && (
 <div className="space-y-1">
 <span className="font-semibold text-sm">Dataset Summary:</span>
 <div className="grid grid-cols-2 gap-2 mt-1">
 {settings.descriptionAttributes.map(attr => (
 <div key={attr} className="flex justify-between text-sm bg-white p-2 rounded">
 <span className="font-medium text-gray-700">{attr}:</span>
 <span className="text-gray-500">{getAttributeValue(attr)}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}