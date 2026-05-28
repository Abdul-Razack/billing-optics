import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
}

export function exportToCSV(data: any[], columns: ExportColumn[], filename: string = 'export') {
  const exportData = data.map(row => {
    const newRow: Record<string, any> = {};
    columns.forEach(col => {
      // support nested keys like 'category.name'
      const value = col.key.split('.').reduce((acc, part) => acc && acc[part], row);
      newRow[col.header] = value !== undefined && value !== null ? value : '';
    });
    return newRow;
  });

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXLSX(data: any[], columns: ExportColumn[], filename: string = 'export') {
  const exportData = data.map(row => {
    const newRow: Record<string, any> = {};
    columns.forEach(col => {
      const value = col.key.split('.').reduce((acc, part) => acc && acc[part], row);
      newRow[col.header] = value !== undefined && value !== null ? value : '';
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToJSON(data: any[], columns: ExportColumn[], filename: string = 'export') {
  const exportData = data.map(row => {
    const newRow: Record<string, any> = {};
    columns.forEach(col => {
      const value = col.key.split('.').reduce((acc, part) => acc && acc[part], row);
      newRow[col.header] = value !== undefined && value !== null ? value : null;
    });
    return newRow;
  });

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
