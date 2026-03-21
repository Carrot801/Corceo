export const chartData = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    { label: 'Red', group: 'Red', data: [12,0,0,0,0,0], backgroundColor: 'red' },

    { label: 'Blue', group: 'Blue', data: [0,19,0,0,0,0], backgroundColor: 'blue' },

    { label: 'Yellow Section 1', group: 'Yellow', data: [0,0,3,0,0,0], backgroundColor: '#FFF176' },
    { label: 'Yellow Section 5', group: 'Yellow', data: [0,0,5,0,0,0], backgroundColor: '#00d4f0ff' },

    { label: 'Green', group: 'Green', data: [0,0,0,5,0,0], backgroundColor: 'green' },
    { label: 'Purple', group: 'Purple', data: [0,0,0,0,2,0], backgroundColor: 'purple' },
    { label: 'Orange', group: 'Orange', data: [0,0,0,0,0,3], backgroundColor: 'orange' }
  ]
};
export const doughnutChartData = {
  labels: ['Red','Blue','Yellow','Green','Purple','Orange'],
  datasets: [
    {
      label: 'My Doughnut Chart',
      data: [12,19,8,5,2,3], // original values never changed
      backgroundColor: ['red','blue','#FFF176','green','purple','orange'],
      borderColor: ['white','white','white','white','white','white'],
      borderWidth: 2,
      hiddenSlices: [false,false,false,false,false,false] // only store visibility
    }
  ]
};