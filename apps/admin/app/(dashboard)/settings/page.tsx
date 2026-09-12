import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listSystemSettings, listAdminUsers } from "@/lib/data";
import { SettingsManager } from "@/components/settings-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, admins] = await Promise.all([listSystemSettings(), listAdminUsers()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Konfigurasi sistem & admin RBAC (§46, §52).</p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">System Settings</h2>
        <SettingsManager
          initial={settings.map((s) => ({ key: String(s.key), value: s.value }))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>{admins.length} akun admin. Kelola role via database untuk saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Belum ada admin terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((a) => (
                  <TableRow key={String(a.id)}>
                    <TableCell className="font-medium">{String(a.name ?? "—")}</TableCell>
                    <TableCell>{String(a.email)}</TableCell>
                    <TableCell>
                      {((a.roles as string[]) ?? []).map((r) => (
                        <Badge key={r} variant="secondary" className="mr-1">
                          {r}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === "ACTIVE" ? "default" : "secondary"}>{String(a.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.last_login_at ? new Date(String(a.last_login_at)).toLocaleString("id-ID") : "—"}
                    </TableCell>
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
