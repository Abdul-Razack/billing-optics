import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fetchClient } from '@/lib/api-client';

interface AuditLog {
  id: number;
  action: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

interface Props {
  prescriptionId: number;
}

export function PrescriptionHistoryTimeline({ prescriptionId }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetchClient<{ success: boolean; data: AuditLog[] }>(`/prescriptions/${prescriptionId}/history`);
        if (res.success) {
          setLogs(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch prescription history", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [prescriptionId]);

  const renderChanges = (oldVals: any, newVals: any) => {
    if (!oldVals || !newVals) return null;
    const changes: React.ReactNode[] = [];
    
    // Compare eyes
    ['re', 'le'].forEach(eye => {
      ['sph', 'cyl', 'axis', 'va', 'add'].forEach(param => {
        const oldVal = oldVals[eye]?.[param];
        const newVal = newVals[eye]?.[param];
        
        if (oldVal !== newVal) {
          changes.push(
            <div key={`${eye}-${param}`} className="text-sm">
              <span className="font-semibold">{eye.toUpperCase()} {param.toUpperCase()}:</span>{' '}
              <span className="line-through text-red-500 mr-2">{oldVal || 'None'}</span> 
              <span className="text-green-600 font-bold">➔ {newVal || 'None'}</span>
            </div>
          );
        }
      });
    });

    if (changes.length === 0) {
      return <div className="text-sm text-gray-500 italic">No visible changes recorded</div>;
    }

    return <div className="mt-2 p-3 bg-gray-50 rounded-md border">{changes}</div>;
  };

  if (loading) return <div className="p-4 text-center">Loading history...</div>;

  if (logs.length === 0) return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No updates have been made to this prescription.</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={log.id} className="relative pl-6 border-l-2 border-blue-200 last:border-l-0">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5" />
              <div className="mb-1 text-sm text-gray-500">
                {format(new Date(log.createdAt), 'PPP p')}
              </div>
              <div className="font-medium text-gray-900">
                Updated by {log.user?.firstName} {log.user?.lastName}
              </div>
              {renderChanges(log.oldValues, log.newValues)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
