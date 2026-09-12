import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await listAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat perubahan admin (§26). Append-only — tidak ada edit/hapus.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Aktivitas</CardTitle>
          <CardDescription>{logs.length} entri terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Belum ada aktivitas tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((l) => (
                  <TableRow key={String(l.id)}>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.created_at ? new Date(String(l.created_at)).toLocaleString("id-ID") : "—"}
                    </TableCell>
                    <TableCell>{String(l.admin_name ?? l.admin_email ?? "Sistem")}</TableCell>
                    <TableCell className="font-medium">{String(l.action)}</TableCell>
                    <TableCell>
                      {String(l.entity_type)}
                      {l.entity_id ? ` #${String(l.entity_id)}` : ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{String(l.reason ?? "—")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
