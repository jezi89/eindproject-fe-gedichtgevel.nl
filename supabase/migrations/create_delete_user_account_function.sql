-- Function to allow users to delete their own account
-- This must be run in the Supabase SQL Editor

create or replace function delete_user_account(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Verify the user is deleting their own account
  if user_id = auth.uid() then
    delete from auth.users where id = user_id;
  else
    raise exception 'Unauthorized: You can only delete your own account';
  end if;
end;
$$;
