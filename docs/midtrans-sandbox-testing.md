# ATLASE — Midtrans Sandbox Verification

How to verify QRIS payment + webhook signature handling against the **Midtrans
Sandbox** environment without a live merchant.

## 1. Create a QRIS transaction (sandbox)

Set `MIDTRANS_SERVER_KEY` (sandbox server key) and `MIDTRANS_IS_SANDBOX=true`.

```powershell
$serverKey = "<sandbox-server-key>"
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${serverKey}:"))

$body = @{
  transaction_details = @{
    order_id = "ATL-260902-000001"
    gross_amount = 85000
  }
  payment_type = "qris"
  qris = @{}
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri "https://app.sandbox.midtrans.com/snap/v1/transactions" `
  -Headers @{ "Content-Type" = "application/json"; "Accept"="application/json"; "Authorization"="Basic $auth" } `
  -Body $body
```

Responds with `{"token": "...", "redirect_url": "..."}` (Snap) or a QRIS `qr_string`.

## 2. Generate a legitimate webhook notification

From `apps/web`, use the signed-payload helper (SHA512 per Midtrans spec):

```ts
import { signedNotification } from "@/lib/webhook-test";
const payload = signedNotification("ATL-260902-000001", "85000.00", "200", "settlement");
```

Or via Node one-liner to print a signed JSON you can curl:

```bash
node -e "const h=require('crypto').createHash('sha512').update('ATL-260902-000001'+'200'+'85000.00'+'<server-key>').digest('hex'); console.log(JSON.stringify({order_id:'ATL-260902-000001',status_code:'200',gross_amount:'85000.00',transaction_status:'settlement',signature_key:h}))"
```

## 3. POST the notification to your webhook

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/payments/webhook" `
  -ContentType "application/json" -Body $signedJson
```

Expect `200 { ok: true }`. A tampered `gross_amount` or swapped `order_id`
returns `401` (signature mismatch) and is logged to `payment_events`.

## 4. What to check

- Genuine signature → 200, payment/order move PENDING → PAID (idempotent).
- Replayed notification → no duplicate state transition (idempotency).
- Wrong key / tampered amount → 401, event logged with `verified: false`.
- Sandbox expiry → `transaction_status: expire` → order → EXPIRED.

## Unit coverage

`apps/web/lib/webhook-test.test.ts` + `apps/web/lib/midtrans.test.ts` cover:
genuine accepted, tampered amount rejected, swapped order id rejected, wrong
server key rejected — all via the pure SHA512 verifier.