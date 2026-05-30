"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Monitor, Loader2, AlertCircle } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ActivationPage() {
  const [hardwareId, setHardwareId] = useState<string>("Loading...");
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClient<{ hardwareId: string }>("/license/hardware-id")
      .then((res) => setHardwareId(res.hardwareId))
      .catch(() => setHardwareId("Failed to load Hardware ID"));
  }, []);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchClient<{ success: boolean; message: string }>("/license/activate", {
        data: { token: licenseKey }
      });
      
      if (res.success) {
        toast.success(res.message);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to activate license.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Activate Billing Optics</CardTitle>
          <CardDescription>
            Your trial or previous license has expired. Please activate to continue using the ERP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <Monitor className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-semibold">Device Hardware ID</h3>
            </div>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all bg-white dark:bg-black p-2 rounded border">
              {hardwareId}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Provide this ID to your vendor to generate a valid license key for this specific machine.
            </p>
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="licenseKey" className="text-sm font-medium">License Key Token</label>
              <textarea
                id="licenseKey"
                rows={5}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6..."
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 text-destructive p-4 flex items-start gap-3 bg-destructive/10">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <h5 className="font-medium leading-none tracking-tight mb-1">Activation Failed</h5>
                  <div className="text-sm opacity-90">{error}</div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !licenseKey.trim() || hardwareId.includes('Failed')}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Activate Product'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-xs text-zinc-500">
            Billing Optics ERP • Offline Activation Supported
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
