-- Migration to update foreign key constraints on poem table to allow user deletion
-- This ensures that when a user is deleted:
-- 1. Poems they 'own' (user_id) are deleted (CASCADE)
-- 2. Poems they 'added' (added_by) are kept but the field is cleared (SET NULL)

-- Drop existing constraints
ALTER TABLE public.poem DROP CONSTRAINT IF EXISTS poems_added_by_fkey;
ALTER TABLE public.poem DROP CONSTRAINT IF EXISTS poems_user_id_fkey;

-- Re-add constraints with appropriate ON DELETE rules

-- If the user who 'owns' the poem is deleted, delete the poem
ALTER TABLE public.poem
    ADD CONSTRAINT poems_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profile(id)
    ON DELETE CASCADE;

-- If the user who 'added' the poem is deleted, keep the poem but clear the added_by field
ALTER TABLE public.poem
    ADD CONSTRAINT poems_added_by_fkey
    FOREIGN KEY (added_by)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;
