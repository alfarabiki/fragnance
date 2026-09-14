import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function E2ENotice() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">E2E Test Config</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi expected values untuk E2E tests. File: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">e2e/test-config.ts</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>
            E2E tests sekarang baca expected values dari <code className="bg-muted px-1 py-0.5 rounded">e2e/test-config.ts</code>.
            Kalau kamu ubah konten CMS (Hero, FAQ, dll), update file ini juga agar tests tetap pass.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Storefront Config</h3>
              <pre className="mt-2 rounded bg-muted p-3 text-xs overflow-auto">
{`storefront: {
  title: /Miz/,
  heroBadge: /Premium · Made Personal/,
  heroTitle: /PREMIUM FRAGRANCE\\./,
  startingPrice: /Mulai dari/,
  ctaText: /Pilih Aroma/,
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium">Builder Config</h3>
              <pre className="mt-2 rounded bg-muted p-3 text-xs overflow-auto">
{`builder: {
  title: /Buat Parfum Kamu/,
  step1: /1 · Pilih Aroma/,
  step2: /2 · Pilih Ukuran/,
  step3: /3 · Seberapa Kuat Aromanya/,
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium">Admin Config</h3>
              <pre className="mt-2 rounded bg-muted p-3 text-xs overflow-auto">
{`admin: {
  loginTitle: /Masuk ke Admin Miz/,
  dashboardTitle: /Dashboard/,
  fragrancesPage: /Fragrances/,
}`}
              </pre>
            </div>
            <Badge variant="secondary">Next: read/write from DB via /api/test-config (optional)</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <a
            href="https://github.com/alfarabiki/fragnance/blob/main/e2e/test-config.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
          >
            Edit test-config.ts di GitHub
          </a>
          <a
            href="/settings"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
          >
            Kelola CMS (Hero, FAQ, dll)
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
