

ALTER TABLE payment_sessions
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'NPR'
CHECK (currency IN ('NPR', 'USD'));


CREATE INDEX IF NOT EXISTS idx_payment_sessions_currency ON payment_sessions(currency);


UPDATE payment_sessions
SET currency = 'NPR'
WHERE currency IS NULL OR currency = '';
