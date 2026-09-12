// Tells the (separately deployed) web app to drop its ISR cache right after
// a catalog write, instead of waiting out its 60s revalidate window. Best
// effort — a failure here must not fail the admin write that already
// succeeded in the database.
export async function revalidateWeb(): Promise<void> {
  const url = process.env.WEB_APP_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  try {
    await fetch(`${url}/api/revalidate`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
    });
  } catch (e) {
    console.error("revalidateWeb failed:", e);
  }
}
