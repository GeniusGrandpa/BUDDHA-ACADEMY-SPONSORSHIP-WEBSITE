CREATE OR REPLACE FUNCTION log_donation_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO activities (
    user_id,
    activity_type,
    title,
    description,
    entity_type,
    entity_id,
    is_public,
    metadata
  ) VALUES (
    NEW.donor_id,
    CASE
      WHEN NEW.status = 'verified' THEN 'donation_verified'
      ELSE 'donation_received'
    END,
    CASE
      WHEN NEW.status = 'verified' THEN 'Donation Verified'
      ELSE 'Donation Received'
    END,
    CASE
      WHEN NEW.status = 'verified' THEN format('Donation of NPR %s has been verified.', NEW.amount::text)
      ELSE format('A donation of NPR %s has been received.', NEW.amount::text)
    END,
    'donations',
    NEW.id,
    CASE WHEN NEW.status = 'verified' THEN true ELSE false END,
    jsonb_build_object('amount', NEW.amount, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;
