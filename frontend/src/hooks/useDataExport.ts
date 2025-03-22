import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface ExportOptions {
  filename?: string;
  timestamp?: boolean;
  extension?: string;
}

export const useDataExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getFilename = useCallback(({ 
    filename = 'export',
    timestamp = true,
    extension
  }: ExportOptions = {}) => {
    const base = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const time = timestamp ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}` : '';
    const ext = extension ? `.${extension}` : '';
    return `${base}${time}${ext}`;
  }, []);

  const exportData = useCallback(async <T>(
    data: T[],
    transformer: (data: T[]) => Promise<Blob>,
    options: ExportOptions = {}
  ) => {
    try {
      setExporting(true);
      setError(null);
      const blob = await transformer(data);
      saveAs(blob, getFilename(options));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Export failed');
      setError(error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, [getFilename]);

  const exportToCsv = useCallback(async <T>(
    data: T[],
    headers: { [K in keyof T]?: string },
    options?: ExportOptions
  ) => {
    const transformer = async (data: T[]) => {
      const headerRow = Object.values(headers).join(',');
      const rows = data.map(item =>
        Object.keys(headers)
          .map(key => `"${item[key as keyof T] || ''}"`)
          .join(',')
      );
      const csv = [headerRow, ...rows].join('\n');
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    };

    return exportData(data, transformer, {
      ...options,
      extension: 'csv'
    });
  }, [exportData]);

  const exportToExcel = useCallback(async <T>(
    data: T[],
    headers: { [K in keyof T]?: string },
    options?: ExportOptions
  ) => {
    const transformer = async (data: T[]) => {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        data.map(item =>
          Object.fromEntries(
            Object.entries(headers).map(([key, label]) => [
              label,
              item[key as keyof T]
            ])
          )
        )
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    };

    return exportData(data, transformer, {
      ...options,
      extension: 'xlsx'
    });
  }, [exportData]);

  return {
    exporting,
    error,
    exportToCsv,
    exportToExcel,
    exportData,
  };
};