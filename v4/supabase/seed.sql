-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_ceremonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can manage their own profile)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Wedding events policies (users can only access events they have permission for)
CREATE POLICY "Users can view events they have access to" ON wedding_events
    FOR SELECT USING (
        created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM event_users 
            WHERE event_id = wedding_events.id 
            AND user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Event creators can update events" ON wedding_events
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM event_users 
            WHERE event_id = wedding_events.id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'editor')
        )
    );

CREATE POLICY "Authenticated users can create events" ON wedding_events
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Event users policies (manage event access)
CREATE POLICY "Event owners can manage event users" ON event_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = event_users.event_id 
            AND created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM event_users eu2
            WHERE eu2.event_id = event_users.event_id 
            AND eu2.user_id = auth.uid() 
            AND eu2.role IN ('owner', 'admin')
        )
    );

-- Ceremonies policies (inherit from wedding_events access)
CREATE POLICY "Users can view ceremonies for accessible events" ON ceremonies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = ceremonies.event_id 
            AND (
                created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = ceremonies.event_id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage ceremonies" ON ceremonies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = ceremonies.event_id 
            AND (
                created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = ceremonies.event_id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

-- Guests policies (inherit from wedding_events access)
CREATE POLICY "Users can view guests for accessible events" ON guests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = guests.event_id 
            AND (
                created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = guests.event_id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage guests" ON guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = guests.event_id 
            AND (
                created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = guests.event_id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

-- Guest ceremonies policies (inherit from guests access)
CREATE POLICY "Users can view guest ceremonies for accessible events" ON guest_ceremonies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM guests g
            JOIN wedding_events we ON we.id = g.event_id
            WHERE g.id = guest_ceremonies.guest_id
            AND (
                we.created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = we.id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage guest ceremonies" ON guest_ceremonies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM guests g
            JOIN wedding_events we ON we.id = g.event_id
            WHERE g.id = guest_ceremonies.guest_id
            AND (
                we.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = we.id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

-- Communication templates policies (global templates are public, event-specific are private)
CREATE POLICY "Anyone can view global templates" ON communication_templates
    FOR SELECT USING (event_id IS NULL);

CREATE POLICY "Users can view event-specific templates for accessible events" ON communication_templates
    FOR SELECT USING (
        event_id IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = communication_templates.event_id 
            AND (
                created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = communication_templates.event_id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage event templates" ON communication_templates
    FOR ALL USING (
        event_id IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = communication_templates.event_id 
            AND (
                created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = communication_templates.event_id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

CREATE POLICY "Admins can manage global templates" ON communication_templates
    FOR ALL USING (
        event_id IS NULL 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Hotels policies (inherit from wedding_events access)
CREATE POLICY "Users can view hotels for accessible events" ON hotels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = hotels.event_id 
            AND (
                created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = hotels.event_id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage hotels" ON hotels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = hotels.event_id 
            AND (
                created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = hotels.event_id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

-- Accommodations policies (inherit from wedding_events access)
CREATE POLICY "Users can view accommodations for accessible events" ON accommodations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = accommodations.event_id 
            AND (
                created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = accommodations.event_id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage accommodations" ON accommodations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM wedding_events 
            WHERE id = accommodations.event_id 
            AND (
                created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = accommodations.event_id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

-- Room allocations policies (inherit from accommodations access)
CREATE POLICY "Users can view room allocations for accessible events" ON room_allocations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM accommodations a
            JOIN wedding_events we ON we.id = a.event_id
            WHERE a.id = room_allocations.accommodation_id
            AND (
                we.created_by = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = we.id 
                    AND user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Event editors can manage room allocations" ON room_allocations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM accommodations a
            JOIN wedding_events we ON we.id = a.event_id
            WHERE a.id = room_allocations.accommodation_id
            AND (
                we.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM event_users 
                    WHERE event_id = we.id 
                    AND user_id = auth.uid() 
                    AND role IN ('owner', 'admin', 'editor')
                )
            )
        )
    );

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some global communication templates
INSERT INTO communication_templates (event_id, category_id, template_id, channel, name, description, subject, content, variables, tags, enabled, sort_order) VALUES
-- Initial Invitations
(NULL, 'initial_invitations', 'save_the_date_email', 'email', 'Save the Date - Email', 'Formal save the date announcement', 'Save the Date - {{couple_names}} Wedding', 
'Dear {{guest_name}},

We are delighted to share some wonderful news with you! 

{{couple_names}} are getting married!

📅 Date: {{wedding_date}}
📍 Location: {{wedding_location}}

Please save the date and watch for your formal invitation to follow.

We cannot wait to celebrate this special day with you!

With love and excitement,
{{couple_names}}', 
ARRAY['guest_name', 'couple_names', 'wedding_date', 'wedding_location'], 
ARRAY['save-the-date', 'initial', 'email'], 
true, 1),

-- RSVP Invitations  
(NULL, 'formal_invitations', 'wedding_invitation_email', 'email', 'Wedding Invitation - Email', 'Complete wedding invitation with RSVP link', 'You''re Invited - {{couple_names}} Wedding Celebration', 
'Dear {{guest_name}},

With great joy, we invite you to celebrate the wedding of

{{couple_names}}

{{ceremony_details}}

Your presence would make our special day even more meaningful.

Please RSVP by {{rsvp_deadline}}:
{{rsvp_link}}

We look forward to celebrating with you!

With love,
{{couple_names}}', 
ARRAY['guest_name', 'couple_names', 'ceremony_details', 'rsvp_deadline', 'rsvp_link'], 
ARRAY['invitation', 'rsvp', 'formal', 'email'], 
true, 1),

-- RSVP Reminders
(NULL, 'rsvp_followups', 'gentle_reminder_email', 'email', 'Gentle RSVP Reminder', 'Polite reminder for pending RSVPs', 'RSVP Reminder - {{couple_names}} Wedding', 
'Dear {{guest_name}},

We hope this message finds you well! 

We wanted to send a gentle reminder about our upcoming wedding celebration. We haven''t yet received your RSVP and would love to know if you''ll be able to join us.

Wedding Details:
{{ceremony_details}}

Please let us know by {{rsvp_deadline}}:
{{rsvp_link}}

Thank you for taking a moment to respond!

With warm regards,
{{couple_names}}', 
ARRAY['guest_name', 'couple_names', 'ceremony_details', 'rsvp_deadline', 'rsvp_link'], 
ARRAY['reminder', 'rsvp', 'followup', 'email'], 
true, 1);

-- Create initial admin user (will be updated with real credentials)
-- This is just a placeholder - real admin setup will be done via Supabase Auth
-- The trigger above will handle profile creation automatically