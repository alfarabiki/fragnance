import { Container, Stack, Badge, Button } from "@atlase/ui";
import { canTransition } from "@atlase/domain";

const modules = [
  "Dashboard",
  "Orders",
  "Products",
  "Fragrances",
  "Bottles",
  "Packaging",
  "Pricing",
  "Pricing Rules",
  "Inventory",
  "Customers",
  "Payments",
  "WhatsApp Orders",
  "Promotions",
  "Analytics",
  "Audit Logs",
  "Settings",
] as const;

const recentOrders = [
  { id: "ATL-260901-000128", status: "PAID" as const },
  { id: "ATL-260901-000127", status: "DRAFT" as const },
  { id: "ATL-260901-000126", status: "CONFIRMED" as const },
];

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-ivory-200 bg-black p-6 text-ivory">
        <Stack className="gap-2">
          <span className="text-heading-1 text-ivory">ATLASE</span>
          <span className="text-caption text-muted-gray">Admin</span>
          <div className="mt-4 flex flex-col gap-1">
            {modules.map((m) => (
              <a
                key={m}
                href="#"
                className="rounded px-3 py-2 text-body-sm text-ivory/80 hover:bg-black-600 hover:text-emerald"
              >
                {m}
              </a>
            ))}
          </div>
        </Stack>
      </aside>

      <main className="flex-1 p-8">
        <Container className="max-w-[1024px]">
          <Stack className="gap-6">
            <div>
              <h1 className="text-display-3 font-semibold">Dashboard</h1>
              <p className="text-caption text-muted-gray">
                Ringkasan pesanan terbaru
              </p>
            </div>

            <section className="rounded-lg border border-ivory-200 bg-white p-6">
              <h2 className="text-heading-2">Pesanan Terbaru</h2>
              <div className="mt-4 divide-y divide-ivory-200">
                {recentOrders.map((o) => {
                  const payable =
                    o.status === "PAID" ||
                    canTransition(o.status, "PAID");
                  return (
                    <Stack
                      key={o.id}
                      direction="row"
                      className="items-center justify-between py-3"
                    >
                      <span className="text-body">{o.id}</span>
                      <Stack direction="row" className="items-center gap-2">
                        <Badge variant={payable ? "success" : "neutral"}>
                          {o.status}
                        </Badge>
                        {payable ? (
                          <Button intent="primary" size="sm">
                            Lanjutkan
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  );
                })}
              </div>
            </section>
          </Stack>
        </Container>
      </main>
    </div>
  );
}

