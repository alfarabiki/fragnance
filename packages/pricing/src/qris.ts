export function crc16(str: string): string {
  let crc = 0xffff
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0")
}

function extractTag(qris: string, targetTag: string): string {
  let i = 0
  while (i + 4 <= qris.length) {
    const tag = qris.slice(i, i + 2)
    const len = Number.parseInt(qris.slice(i + 2, i + 4), 10)
    if (!Number.isFinite(len) || len < 0) break
    const valStart = i + 4
    const valEnd = valStart + len
    if (tag === targetTag) return qris.slice(valStart, valEnd)
    i = valEnd
  }
  return ""
}

export function extractMerchantName(qris: string): string {
  return extractTag(qris, "59")
}

export function validateStaticPayload(qris: string): string | null {
  if (typeof qris !== "string" || qris.length < 20) return "QRIS tidak valid atau terlalu pendek"
  if (!qris.startsWith("000201")) return "QRIS tidak memiliki header 000201"
  if (!qris.includes("5802ID")) return "QRIS tidak memiliki country code 58=ID"
  if (!extractMerchantName(qris)) return "QRIS tidak memiliki tag 59 (Merchant Name)"
  const crcIdx = qris.lastIndexOf("6304")
  if (crcIdx === -1 || crcIdx + 8 > qris.length) return "QRIS tidak memiliki CRC tag 63 yang valid"
  const providedCrc = qris.slice(crcIdx + 4, crcIdx + 8).toUpperCase()
  if (!/^[0-9A-F]{4}$/.test(providedCrc)) return "CRC bukan hex 4 digit"
  if (providedCrc !== crc16(qris.slice(0, crcIdx + 4))) return "CRC tidak sesuai dengan payload"
  return null
}

export function toDynamic(staticQris: string, nominal: string | number): string {
  const nominalStr = String(Math.round(Number(nominal)))
  if (!/^\d{1,13}$/.test(nominalStr) || Number(nominalStr) <= 0) {
    throw new Error("Nominal harus berupa angka positif (maks 13 digit)")
  }
  const err = validateStaticPayload(staticQris)
  if (err) throw new Error(err)
  const body = staticQris.slice(0, -4)
  const withPointOfInitiation = body.replace("010211", "010212")
  const parts = withPointOfInitiation.split("5802ID")
  const beforeCountry = parts[0] ?? ""
  const afterCountry = parts[1] ?? ""
  const amountField = "54" + nominalStr.length.toString().padStart(2, "0") + nominalStr
  const withoutCrc = beforeCountry.trim() + amountField + "5802ID" + afterCountry.trim()
  return withoutCrc + crc16(withoutCrc)
}

function staticString(): string | undefined {
  return process.env.QRIS_STATIC_STRING ?? process.env.MIZ_QRIS_STATIC_STRING
}

export function isConfigured(): boolean {
  return !!staticString()
}

const DEFAULT_MDR_RATE = 0.007

export function getMdrRate(): number {
  const envRate = Number(process.env.QRIS_MDR_RATE)
  return Number.isFinite(envRate) && envRate >= 0 ? envRate : DEFAULT_MDR_RATE
}

export function calculateServiceFee(baseAmount: number | string): {
  baseAmount: number
  serviceFee: number
  totalAmount: number
  mdrRate: number
} {
  const base = Math.round(Number(baseAmount))
  const rate = getMdrRate()
  const serviceFee = Math.round(base * rate)
  return { baseAmount: base, serviceFee, totalAmount: base + serviceFee, mdrRate: rate }
}

export function generateDynamic(nominal: string | number): { qris: string; merchantName: string } {
  const staticQris = staticString()
  if (!staticQris) throw new Error("QRIS_STATIC_STRING not configured")
  return {
    qris: toDynamic(staticQris, nominal),
    merchantName: extractMerchantName(staticQris),
  }
}
