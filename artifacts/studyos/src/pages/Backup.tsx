import React, { useRef, useState } from "react";
import { useExportBackup, useImportBackup, getExportBackupQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle, CheckCircle2, FileJson } from "lucide-react";

export default function Backup() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMsg, setImportMsg] = useState("");
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");

  const { refetch: fetchBackup, isFetching } = useExportBackup({ query: { queryKey: getExportBackupQueryKey(), enabled: false } });
  const importBackup = useImportBackup();

  const handleExport = async () => {
    setExportStatus("idle");
    try {
      const result = await fetchBackup();
      if (!result.data) throw new Error("No data returned");
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studyos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("success");
    } catch {
      setExportStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus("idle");
    setImportMsg("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        importBackup.mutate({ data }, {
          onSuccess: () => {
            setImportStatus("success");
            setImportMsg("Data imported successfully. All sections have been restored.");
            queryClient.invalidateQueries();
          },
          onError: () => {
            setImportStatus("error");
            setImportMsg("Import failed. Make sure the file is a valid StudyOS backup.");
          }
        });
      } catch {
        setImportStatus("error");
        setImportMsg("Invalid JSON file. Please select a valid StudyOS backup.");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="text-muted-foreground mt-1">Export your data or restore from a previous backup.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="w-4 h-4 text-primary" />
            Export Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Downloads all your data — subjects, chapters, tasks, events, sessions, and settings — as a single JSON file.
          </p>
          <Button onClick={handleExport} disabled={isFetching} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            {isFetching ? "Preparing..." : "Download Backup"}
          </Button>
          {exportStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Backup downloaded successfully.
            </div>
          )}
          {exportStatus === "error" && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" /> Export failed. Please try again.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="w-4 h-4 text-primary" />
            Import / Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Warning:</strong> Importing will overwrite all existing subjects, chapters, tasks, and events. This cannot be undone. Make sure you have a current backup first.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Select a previously exported StudyOS JSON backup file to restore your data.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importBackup.isPending}
            className="w-full sm:w-auto"
          >
            <FileJson className="w-4 h-4 mr-2" />
            {importBackup.isPending ? "Importing..." : "Select Backup File"}
          </Button>
          {importStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" /> {importMsg}
            </div>
          )}
          {importStatus === "error" && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" /> {importMsg}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Backup Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Backups are plain JSON files containing all your data. They include a <code className="bg-muted px-1 rounded text-xs">version</code> field and a <code className="bg-muted px-1 rounded text-xs">exportedAt</code> timestamp. Keep your backups safe — they contain all your study progress.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
