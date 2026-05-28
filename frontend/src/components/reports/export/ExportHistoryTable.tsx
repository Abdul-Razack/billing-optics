import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { ExportStatus, ExportStatusBadge } from "./ExportStatusBadge";
import { format } from "date-fns";

export interface ExportRecord {
  id: string;
  type: string;
  format: string;
  dateRange: string;
  createdAt: string;
  status: ExportStatus;
  url?: string;
  size?: string;
}

interface ExportHistoryProps {
  history: ExportRecord[];
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ExportHistoryTable({ history, onDownload, onDelete }: ExportHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-gray-50/50 rounded-md border border-dashed">
        <RefreshCw className="h-8 w-8 mb-4 text-gray-300" />
        <p>No export history found.</p>
        <p className="text-sm">Generated reports will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report Type</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Requested On</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.type}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{record.dateRange}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(record.createdAt), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell>
                <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                  {record.format}
                </span>
                {record.size && <span className="text-xs text-muted-foreground ml-2">{record.size}</span>}
              </TableCell>
              <TableCell>
                <ExportStatusBadge status={record.status} />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={record.status !== "completed"}
                  onClick={() => onDownload(record.id)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(record.id)}
                  title="Delete Record"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
