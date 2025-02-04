export const convertToCSV = (data) => {
  if (!data || !data.length) return '';

  // Define headers based on the data structure
  const headers = [
    'Timestamp',
    'Hot Air (Inlet) °C',
    'Cold Air (Outlet) °C',
    'Dry Fan Speed %',
    'Wet Fan Speed %'
  ];

  // Convert data to CSV rows
  const rows = data.map(item => [
    new Date(item.timestamp).toLocaleString(),
    item.inlet.toFixed(2),
    item.dryOutlet.toFixed(2),
    item.dryFan,
    item.wetFan
  ]);

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
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5); // Remove milliseconds
  return `temperature_log_${timestamp}.csv`;
};
