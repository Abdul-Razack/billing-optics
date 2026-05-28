export const generateCsv = (data: any[]): string => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  
  // Create header row
  const csvRows = [];
  csvRows.push(headers.map(header => escapeCsvValue(header)).join(','));

  // Create data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return escapeCsvValue(val);
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

const escapeCsvValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  let str = String(value);
  
  // If the value contains comma, newline or double quote, we need to quote it
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    // Escape double quotes by replacing " with ""
    str = str.replace(/"/g, '""');
    str = `"${str}"`;
  }
  
  return str;
};
