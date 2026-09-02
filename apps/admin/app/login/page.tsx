import { Button, Container, Stack } from "@atlase/ui";

export default function AdminLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <Container className="max-w-[480px]">
        <div className="rounded-lg border border-black-600 bg-black-600 p-8">
          <Stack className="gap-6">
            <div>
              <h1 className="text-display-3 font-semibold text-ivory">
                Masuk ke Admin ATLASE
              </h1>
              <p className="text-caption text-muted-gray">
                Gunakan akun admin untuk mengelola platform.
              </p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-label text-ivory">Email</span>
              <input
                type="email"
                name="email"
                className="rounded border border-black-400 bg-black px-3 py-2 text-body text-ivory focus:ring-2 focus:ring-emerald"
                placeholder="admin@atlase.id"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label text-ivory">Kata Sandi</span>
              <input
                type="password"
                name="password"
                className="rounded border border-black-400 bg-black px-3 py-2 text-body text-ivory focus:ring-2 focus:ring-emerald"
                placeholder="• • • • • • • •"
              />
            </label>
            <Button intent="primary" size="lg">
              Masuk
            </Button>
          </Stack>
        </div>
      </Container>
    </main>
  );
}