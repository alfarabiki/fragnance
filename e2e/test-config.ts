/**
 * E2E test configuration — editable from admin.mizparfume.com → Settings.
 *
 * Instead of hardcoding expected text (which breaks when the admin changes
 * CMS content), tests read from this config file. Admin can update the
 * expected values here, and E2E tests will verify against the current config.
 *
 * To update: edit this file and commit, OR (future) edit from admin web UI.
 */

export const TEST_CONFIG = {
  // Storefront expected content
  storefront: {
    title: /Miz/,
    heroBadge: /Premium · Made Personal/,
    heroTitle: /PREMIUM FRAGRANCE\./,
    startingPrice: /Mulai dari/,
    ctaText: /Pilih Aroma/,
    footerText: /Miz\./,
  },

  // Builder expected content
  builder: {
    title: /Buat Parfum Kamu/,
    step1: /1 · Pilih Aroma/,
    step2: /2 · Pilih Ukuran/,
    step3: /3 · Seberapa Kuat Aromanya/,
  },

  // Admin expected content
  admin: {
    loginTitle: /Masuk ke Admin Miz/,
    dashboardTitle: /Dashboard/,
    fragrancesPage: /Fragrances/,
    settingsPage: /Settings/,
  },

  // Checkout expected content
  checkout: {
    step1: /Pesanan/,
    step2: /Alamat/,
    step3: /Cara Pesan/,
    phoneField: /Nomor WhatsApp/,
    postalCodeField: /Kode Pos/,
  },

  // Payment expected content
  payment: {
    whatsappChannel: /Selesaikan via WhatsApp/,
    qrisChannel: /Menunggu Pembayaran/,
    payButton: /Saya Sudah Bayar/,
  },

  // URLs (relative to baseURL)
  urls: {
    home: "/",
    aroma: "/aroma",
    builder: "/buat-parfum",
    checkout: "/checkout",
    admin: "https://admin.mizparfume.com",
  },
} as const;
