-- Safe User Deletion Function for Super Admin
-- This migration adds a secure user deletion function that soft-deletes users
-- while preserving all historical student, sponsorship, and payment data.

-- Add 'deleted' status to profiles if not already supported
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_status_check' 
    AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'profiles')
  ) THEN
    ALTER TABLE profiles 
    DROP CONSTRAINT IF EXISTS profiles_status_check;
    
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_status_check 
    CHECK (status IN ('active', 'inactive', 'suspended', 'banned', 'deleted'));
  END IF;
END $$;

-- Create function to check user's related records
CREATE OR REPLACE FUNCTION public.get_user_related_record_counts(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  donation_count INTEGER;
  sponsorship_count INTEGER;
  notification_count INTEGER;
  audit_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO donation_count FROM donations WHERE donor_id = target_user_id;
  SELECT COUNT(*) INTO sponsorship_count FROM sponsorships WHERE donor_id = target_user_id;
  SELECT COUNT(*) INTO notification_count FROM notifications WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO audit_count FROM audit_logs WHERE actor_id = target_user_id OR entity_id = target_user_id;
  
  RETURN jsonb_build_object(
    'donations', donation_count,
    'sponsorships', sponsorship_count,
    'notifications', notification_count,
    'audit_logs', audit_count
  );
END;
$$;

-- Create secure user deletion function
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID,
  delete_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  current_status TEXT;
  current_role TEXT;
  related_counts JSONB;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Verify caller is super_admin
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can delete users' USING ERRCODE = '42501';
  END IF;
  
  -- Prevent self-deletion
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account' USING ERRCODE = '42501';
  END IF;
  
  -- Get current user info
  SELECT status, role, email, full_name INTO current_status, current_role, user_email, user_name
  FROM profiles WHERE id = target_user_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  
  -- Prevent deletion of last super admin
  IF current_role = 'super_admin' AND current_status = 'active' THEN
    IF (SELECT COUNT(*) FROM profiles WHERE role = 'super_admin' AND status = 'active') <= 1 THEN
      RAISE EXCEPTION 'Cannot delete the last active super administrator' USING ERRCODE = '42501';
    END IF;
  END IF;
  
  -- Get related record counts for warning/confirmation
  related_counts := get_user_related_record_counts(target_user_id);
  
  -- Perform soft deletion by changing status to 'deleted'
  UPDATE profiles 
  SET 
    status = 'deleted',
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the deletion action
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, created_at)
  VALUES (
    auth.uid(),
    'user.deleted',
    'profile',
    target_user_id,
    jsonb_build_object(
      'previous_status', current_status,
      'previous_role', current_role,
      'user_email', user_email,
      'user_name', user_name,
      'delete_reason', delete_reason,
      'related_records', related_counts,
      'changed_by', auth.uid()
    ),
    now()
  );
  
  -- Return success with related record information
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User deleted successfully',
    'related_records', related_counts,
    'user_email', user_email,
    'user_name', user_name
  );
END;
$$;

-- Grant execute permission to authenticated users (function has internal security checks)
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_related_record_counts TO authenticated;

-- Create function to restore deleted users
CREATE OR REPLACE FUNCTION public.admin_restore_user(
  target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  current_status TEXT;
BEGIN
  -- Verify caller is super_admin
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can restore users' USING ERRCODE = '42501';
  END IF;
  
  -- Get current status
  SELECT status INTO current_status FROM profiles WHERE id = target_user_id;
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  
  IF current_status != 'deleted' THEN
    RAISE EXCEPTION 'User is not deleted' USING ERRCODE = '42501';
  END IF;
  
  -- Restore user to active status
  UPDATE profiles 
  SET 
    status = 'active',
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the restoration
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, created_at)
  VALUES (
    auth.uid(),
    'user.restored',
    'profile',
    target_user_id,
    jsonb_build_object(
      'previous_status', current_status,
      'changed_by', auth.uid()
    ),
    now()
  );
  
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_restore_user TO authenticated;
