export const processChartData = (rawData, settings) => {
  const total = rawData.reduce((sum, item) => sum + (item.y || 0), 0);
  
  return rawData.map(item => ({
    ...item,
    // Calculate percentage based on the current item
    percentage: total !== 0 ? (item.y / total) * 100 : 0,
    // You can add logic here for currency/compact numbers if needed
  }));
};