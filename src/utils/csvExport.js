export const convertToCSV = (data) => {
  if (!data || !data.length) return '';

  // Define headers based on the data structure
  const headers = [
    'Date',
    'Time',
    'Hot Air (Inlet) °C',
    'Cold Air (Outlet) °C',
    'Inlet Humidity %',
    'Outlet Humidity %',
    'Inlet Dew Point °C',
    'Outlet Dew Point °C',
    'Wet Bulb Effectiveness',
    'Dew Point Effectiveness',
    'Mass Flow Rate kg/s',
    'Dry Fan Speed %',
    'Wet Fan Speed %',
    'Pump Status',
    'Total Power W',
    'Cooling Effect W',
    'COP'
  ];

  // Convert data to CSV rows
  const rows = data.map(item => {
    const date = new Date(item.timestamp);
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      item.inlet.toFixed(2),
      item.dryOutlet.toFixed(2),
      item.inletHumidity.toFixed(1),
      item.outletHumidity.toFixed(1),
      item.inletDewPoint.toFixed(2),
      item.outletDewPoint.toFixed(2),
      item.effectiveness.wetBulb.toFixed(3),
      item.effectiveness.dewPoint.toFixed(3),
      item.massFlowRate.toFixed(3),
      item.dryFan.toFixed(1),
      item.wetFan.toFixed(1),
      item.pumpStatus ? 'ON' : 'OFF',
      item.powerTotal.toFixed(1),
      item.coolingEffect.toFixed(1),
      item.cop.toFixed(2)
    ];
  });

  // Combine headers and rows
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  // Trigger the download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateTimestampedFilename = () => {
  const now = new Date();
  const date = now.toLocaleDateString().replace(/[/]/g, '-');
  const time = now.toLocaleTimeString().replace(/[:.]/g, '-');
  return `temperature_log_${date}_${time}.csv`;
};
