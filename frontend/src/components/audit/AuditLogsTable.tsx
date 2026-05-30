import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  action: string;
  module: string;
  recordId: string | null;
  oldValues: any;
  newValues: any;
  device: string | null;
  ipAddress: string | null;
  result: 'SUCCESS' | 'FAILURE';
  details: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

interface AuditLogsTableProps {
  logs: AuditLog[];
  total: number;
  loading: boolean;
  onFilterChange: (filters: any) => void;
  onExport: () => void;
}

export function AuditLogsTable({ logs, total, loading, onFilterChange, onExport }: AuditLogsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    module: 'ALL',
    result: 'ALL',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert 'ALL' back to empty string for API
    const apiFilters = { ...newFilters };
    if (apiFilters.module === 'ALL') delete (apiFilters as any).module;
    if (apiFilters.result === 'ALL') delete (apiFilters as any).result;
    
    onFilterChange(apiFilters);
  };

  const toggleRow = (id: string) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const renderJsonDiff = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return <span className="text-muted-foreground">No data changes recorded.</span>;
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-muted/30 rounded-md">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-destructive">Previous Values</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {oldValues ? JSON.stringify(oldValues, null, 2) : 'None'}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 text-primary">New Values</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {newValues ? JSON.stringify(newValues, null, 2) : 'None'}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <Select value={filters.module} onValueChange={(v) => handleFilterChange('module', v || '')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Modules</SelectItem>
              <SelectItem value="AUTH">Authentication</SelectItem>
              <SelectItem value="CUSTOMER">Customers</SelectItem>
              <SelectItem value="PRODUCT">Products</SelectItem>
              <SelectItem value="INVENTORY">Inventory</SelectItem>
              <SelectItem value="INVOICE">Invoices</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.result} onValueChange={(v) => handleFilterChange('result', v || '')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Results</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILURE">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onExport} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Logs
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Loading audit logs...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No audit logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(log.id)}>
                    <TableCell>
                      {expandedRow === log.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {format(new Date(log.timestamp), 'MMM dd yyyy, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {log.user ? log.user.fullName : <span className="text-muted-foreground italic">System / Unknown</span>}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-muted">
                        {log.module}
                      </span>
                    </TableCell>
                    <TableCell>{log.action.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      {log.result === 'SUCCESS' ? (
                        <span className="flex items-center text-green-600"><CheckCircle2 className="h-4 w-4 mr-1" /> Success</span>
                      ) : (
                        <span className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> Failure</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedRow === log.id && (
                    <TableRow className="bg-muted/10">
                      <TableCell colSpan={6} className="p-0 border-b">
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                            <div><span className="font-semibold text-muted-foreground">Record ID:</span> {log.recordId || 'N/A'}</div>
                            <div><span className="font-semibold text-muted-foreground">IP Address:</span> {log.ipAddress || 'Unknown'}</div>
                            <div className="truncate"><span className="font-semibold text-muted-foreground">Device:</span> {log.device || 'Unknown'}</div>
                          </div>
                          {log.details && (
                            <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">
                              <span className="font-semibold">Error Details:</span> {log.details}
                            </div>
                          )}
                          {(log.oldValues || log.newValues) && renderJsonDiff(log.oldValues, log.newValues)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground text-right">
        Showing {logs.length} of {total} events
      </div>
    </div>
  );
}
