import type { CartItem } from "./cart";

export interface OrderAddress {
  recipientName: string;
  phone: string;
  fullAddress: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  note?: string;
}

export interface OrderMessageInput {
  orderNumber: string;
  items: CartItem[];
  total: number;
  customer: { name: string; phone: string };
  address: OrderAddress;
  strengthLabel?: string;
}

function formatRupiah(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}

function strengthLabel(ml: number): string {
  if (ml <= 17) return "Lembut";
  if (ml <= 27) return "Sedang";
  return "Kuat";
}

export function buildWhatsAppMessage(input: OrderMessageInput): string {
  const sections = input.items
    .map((item, idx) => {
      const strength = strengthLabel(item.fragranceMl);
      const sectionLines = [
        `Produk ${input.items.length > 1 ? idx + 1 : ""}`.trim(),
        item.fragranceName,
        input.items.length > 1 ? "" : "Ukuran:",
        input.items.length > 1 ? "" : `${item.volumeMl} ml`,
        input.items.length > 1 ? "" : "Jumlah aroma:",
        input.items.length > 1 ? "" : `${item.fragranceMl} ml`,
        input.items.length > 1 ? "" : "Kekuatan:",
        input.items.length > 1 ? "" : strength,
        input.items.length > 1 ? "" : "Botol:",
        input.items.length > 1 ? "" : item.bottleName,
        input.items.length > 1 ? "" : "Packaging:",
        input.items.length > 1 ? "" : item.packagingName,
      ]
        .filter((s) => s !== "")
        .join("\n");
      return sectionLines;
    })
    .join("\n\n");

  const multi = input.items.length > 1;
  const lines = [
    "Halo Atlase, saya ingin memesan:",
    "",
    "Order:",
    `#${input.orderNumber}`,
    "",
    sections,
    "",
    "Total:",
    formatRupiah(input.total),
    ...(multi
      ? []
      : [
          "",
          "Nama:",
          input.customer.name,
          "",
          "No. WhatsApp:",
          input.customer.phone,
          "",
          "Alamat:",
          input.address.fullAddress,
          "",
          "Kecamatan:",
          input.address.district,
          "",
          "Kota/Kabupaten:",
          input.address.city,
          "",
          "Provinsi:",
          input.address.province,
          "",
          "Kode Pos:",
          input.address.postalCode,
        ]),
    "",
    "Mohon dibantu proses pesanannya.",
  ];

  return lines.join("\n");
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = phone.replace(/[^\d]/g, "");
  const withCountry = normalized.startsWith("62")
    ? normalized
    : normalized.replace(/^0/, "62");
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}