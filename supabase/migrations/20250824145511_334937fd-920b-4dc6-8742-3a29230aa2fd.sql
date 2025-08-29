-- Create profile for admin user if needed
INSERT INTO profiles (user_id, role, username, full_name)
SELECT 
    auth.uid(),
    'admin',
    'Admin',
    'Administrateur'
WHERE auth.uid() IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid()
    );

-- Update existing profile to admin if user exists but isn't admin
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = auth.uid() 
    AND auth.uid() IS NOT NULL 
    AND role != 'admin';