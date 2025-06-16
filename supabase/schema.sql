-- Create custom types
CREATE TYPE family_role AS ENUM ('admin', 'parent', 'child');
CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'normal', 'low');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Families table
CREATE TABLE families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Family members table
CREATE TABLE family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role family_role DEFAULT 'parent',
    display_name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    permissions JSONB DEFAULT '{}'::jsonb,
    UNIQUE(family_id, user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    assigned_to UUID[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    priority task_priority DEFAULT 'normal',
    status task_status DEFAULT 'pending',
    due_date DATE,
    due_time TIME,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    estimated_duration INTEGER, -- minutes
    actual_duration INTEGER, -- minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_assigned_to ON tasks USING GIN(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
CREATE POLICY "Users can view families they belong to" ON families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = families.id 
            AND family_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create families" ON families
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their families" ON families
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = families.id 
            AND family_members.user_id = auth.uid()
            AND family_members.role = 'admin'
        )
    );

-- RLS Policies for family_members
CREATE POLICY "Users can view family members in their families" ON family_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members fm2
            WHERE fm2.family_id = family_members.family_id 
            AND fm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert family members" ON family_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = family_members.family_id 
            AND family_members.user_id = auth.uid()
            AND family_members.role = 'admin'
        )
        OR user_id = auth.uid() -- Users can add themselves
    );

CREATE POLICY "Admins and users themselves can update family members" ON family_members
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM family_members fm2
            WHERE fm2.family_id = family_members.family_id 
            AND fm2.user_id = auth.uid()
            AND fm2.role = 'admin'
        )
    );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their families" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = tasks.family_id 
            AND family_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Family members can create tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = tasks.family_id 
            AND family_members.user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Family members can update tasks" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = tasks.family_id 
            AND family_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Family members can delete tasks they created or admins can delete any" ON tasks
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_members.family_id = tasks.family_id 
            AND family_members.user_id = auth.uid()
            AND family_members.role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for tasks
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get family members for a family
CREATE OR REPLACE FUNCTION get_family_members(family_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    display_name VARCHAR,
    role family_role,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT fm.id, fm.user_id, fm.display_name, fm.role, fm.joined_at
    FROM family_members fm
    WHERE fm.family_id = family_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tasks for smart lists
CREATE OR REPLACE FUNCTION get_tasks_for_smart_list(
    family_uuid UUID,
    list_type TEXT,
    user_uuid UUID DEFAULT NULL
)
RETURNS SETOF tasks AS $$
BEGIN
    CASE list_type
        WHEN 'today' THEN
            RETURN QUERY
            SELECT * FROM tasks t
            WHERE t.family_id = family_uuid
            AND t.status IN ('pending', 'in_progress')
            AND t.due_date = CURRENT_DATE
            ORDER BY t.due_date ASC, t.priority DESC;
            
        WHEN 'this_week' THEN
            RETURN QUERY
            SELECT * FROM tasks t
            WHERE t.family_id = family_uuid
            AND t.status IN ('pending', 'in_progress')
            AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            ORDER BY t.due_date ASC, t.priority DESC;
            
        WHEN 'overdue' THEN
            RETURN QUERY
            SELECT * FROM tasks t
            WHERE t.family_id = family_uuid
            AND t.status IN ('pending', 'in_progress')
            AND t.due_date < CURRENT_DATE
            ORDER BY t.due_date ASC;
            
        WHEN 'assigned_to_me' THEN
            IF user_uuid IS NOT NULL THEN
                RETURN QUERY
                SELECT * FROM tasks t
                WHERE t.family_id = family_uuid
                AND t.status IN ('pending', 'in_progress')
                AND user_uuid = ANY(t.assigned_to)
                ORDER BY t.due_date ASC, t.priority DESC;
            END IF;
            
        WHEN 'high_priority' THEN
            RETURN QUERY
            SELECT * FROM tasks t
            WHERE t.family_id = family_uuid
            AND t.status IN ('pending', 'in_progress')
            AND t.priority IN ('urgent', 'high')
            ORDER BY t.priority DESC, t.due_date ASC;
            
        WHEN 'completed' THEN
            RETURN QUERY
            SELECT * FROM tasks t
            WHERE t.family_id = family_uuid
            AND t.status = 'completed'
            ORDER BY t.completed_at DESC;
            
        ELSE
            RETURN QUERY
            SELECT * FROM tasks t
            WHERE t.family_id = family_uuid
            ORDER BY t.created_at DESC;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;