import React, { useState, useCallback } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Description as CsvIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

export interface ExportColumn {
  field: string;
  label: string;
  width?: number;
}

interface DataExportProps {
  columns: ExportColumn[];
  getData: () => Promise<any[]>;
  filename?: string;
  allowedFormats?: ('csv' | 'excel' | 'pdf' | 'print')[];
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
}

export const DataExport: React.FC<DataExportProps> = ({
  columns,
  getData,
  filename = 'export',
  allowedFormats = ['csv', 'excel', 'pdf', 'print'],
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map(col => col.field)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedFormat(null);
    setError(null);
  };

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
  };

  const handleColumnToggle = (field: string) => {
    setSelectedColumns(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(
      selectedColumns.length === columns.length
        ? []
        : columns.map(col => col.field)
    );
  };

  const exportToCsv = async (data: any[]) => {
    const headers = columns
      .filter(col => selectedColumns.includes(col.field))
      .map(col => col.label)
      .join(',');
    
    const rows = data.map(row =>
      selectedColumns
        .map(field => `"${row[field] || ''}"`)
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToExcel = async (data: any[]) => {
    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        data.map(row =>
          Object.fromEntries(
            selectedColumns.map(field => [
              columns.find(col => col.field === field)?.label || field,
              row[field]
            ])
          )
        )
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      throw new Error('Failed to export Excel file');
    }
  };

  const exportToPdf = async (data: any[]) => {
    try {
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      autoTable(doc, {
        head: [columns
          .filter(col => selectedColumns.includes(col.field))
          .map(col => col.label)],
        body: data.map(row =>
          selectedColumns.map(field => row[field])
        ),
      });
      doc.save(`${filename}.pdf`);
    } catch (error) {
      throw new Error('Failed to export PDF file');
    }
  };

  const handlePrint = async (data: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${columns
                  .filter(col => selectedColumns.includes(col.field))
                  .map(col => `<th>${col.label}</th>`)
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${selectedColumns
                    .map(field => `<td>${row[field] || ''}</td>`)
                    .join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = async () => {
    if (!selectedFormat) return;

    try {
      setLoading(true);
      setError(null);
      onExportStart?.();

      const data = await getData();

      switch (selectedFormat) {
        case 'csv':
          await exportToCsv(data);
          break;
        case 'excel':
          await exportToExcel(data);
          break;
        case 'pdf':
          await exportToPdf(data);
          break;
        case 'print':
          await handlePrint(data);
          break;
      }

      onExportComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      setError(message);
      onExportError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const exportFormats = [
    { id: 'csv', label: 'CSV', icon: CsvIcon },
    { id: 'excel', label: 'Excel', icon: ExcelIcon },
    { id: 'pdf', label: 'PDF', icon: PdfIcon },
    { id: 'print', label: 'Print', icon: PrintIcon },
  ].filter(format => allowedFormats.includes(format.id as any));

  return (
    <>
      <Button
        startIcon={<FileDownloadIcon />}
        onClick={handleClick}
        variant="outlined"
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {exportFormats.map(format => (
          <MenuItem
            key={format.id}
            onClick={() => handleFormatSelect(format.id)}
          >
            <ListItemIcon>
              <format.icon />
            </ListItemIcon>
            <ListItemText primary={format.label} />
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={Boolean(selectedFormat)}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Options</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select columns to export
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColumns.length === columns.length}
                  indeterminate={selectedColumns.length > 0 && selectedColumns.length < columns.length}
                  onChange={handleSelectAll}
                />
              }
              label="Select All"
            />
            {columns.map(column => (
              <FormControlLabel
                key={column.field}
                control={
                  <Checkbox
                    checked={selectedColumns.includes(column.field)}
                    onChange={() => handleColumnToggle(column.field)}
                  />
                }
                label={column.label}
              />
            ))}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={loading || selectedColumns.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          >
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};