/**
 * Telegram Bot notification service for Miz Parfume.
 * Sends alerts to the team when a customer confirms payment.
 *
 * Setup:
 *   1. Create bot via @BotFather → get token
 *   2. Add bot to group/channel → get chat_id
 *   3. Set env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function isConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID);
}

interface PaymentAlert {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  items: string;
  channel: "QRIS" | "WHATSAPP";
}

export async function sendPaymentAlert(alert: PaymentAlert): Promise<boolean> {
  if (!isConfigured()) return false;

  const emoji = alert.channel === "QRIS" ? "💳" : "📱";
  const totalFormatted = `Rp${alert.total.toLocaleString("id-ID")}`;

  const text = [
    `${emoji} *Pembayaran Baru - Miz Parfume*`,
    ``,
    `📦 Order: *#${alert.orderNumber}*`,
    `👤 ${alert.customerName} (${alert.customerPhone})`,
    `💰 ${totalFormatted} via ${alert.channel}`,
    ``,
    `🧴 Item:`,
    alert.items,
    ``,
    alert.channel === "QRIS"
      ? "⚠️ _Menunggu verifikasi pembayaran QRIS_"
      : "📱 _Menunggu konfirmasi via WhatsApp_",
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[telegram] sendPaymentAlert failed", err);
    return false;
  }
}

interface OrderAlert {
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
}

export async function sendNewOrderAlert(alert: OrderAlert): Promise<boolean> {
  if (!isConfigured()) return false;

  const totalFormatted = `Rp${alert.total.toLocaleString("id-ID")}`;

  const text = [
    `🛒 *Order Baru - Miz Parfume*`,
    ``,
    `📦 Order: *#${alert.orderNumber}*`,
    `👤 ${alert.customerName}`,
    `💰 ${totalFormatted} (${alert.itemCount} item)`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[telegram] sendNewOrderAlert failed", err);
    return false;
  }
}
