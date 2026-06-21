# Payment System

No external SDKs — manual confirmation + admin verification workflow using Khalti / eSewa / Mobile Banking.

## Flow

```
1. Donor selects amount, frequency, optional student sponsorship
        │
2. PaymentModal displays active gateways (QR codes, account details)
        │
3. initiate_payment_checkout RPC creates a payment_session
        │
4. Donor pays externally (bank transfer, eSewa, Khalti)
        │
5. Donor submits transaction reference ID + screenshot
        │
6. AdminPaymentVerificationPage — admin reviews and verifies/rejects
        │
7. verify_payment RPC creates donations record + payment_receipt
        │
8. All steps are audit-logged
```

## Key Design Decisions

- `initiate_payment_checkout()` creates `payment_sessions` independently — no pre-existing donation required
- `verify_payment()` RPC creates the `donations` row **only** on successful verification
- `payment_sessions.idempotency_key` with unique partial index prevents duplicate session creation
- Direct `donations` table inserts are disabled — frontend `createDonation()` throws
- Failed/cancelled/expired/abandoned sessions never create donation records

## Admin Payment Pages

| Page                         | Route                      | Purpose                  |
|------------------------------|----------------------------|--------------------------|
| Payment Verification         | `/admin/payments/verify`   | Review/verify/reject     |
| Payment Settings             | `/admin/payments/settings` | Gateway config, QR codes |
