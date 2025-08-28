/*
  # Create ChatWave Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `display_name` (text)
      - `is_guest` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `conversations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `is_group` (boolean, default false)
      - `created_by` (uuid, references profiles)
      - `last_message` (text)
      - `last_activity` (timestamptz)
      - `created_at` (timestamptz)
    
    - `conversation_members`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `type` (text, default 'text')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
      - Read conversations they're part of
      - Send messages to conversations they're part of
      - Read messages from conversations they're part of
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  is_guest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  is_group boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  last_message text,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create conversation_members table
CREATE TABLE IF NOT EXISTS conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view conversations they are part of"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they created"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Conversation members policies
CREATE POLICY "Users can view members of their conversations"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to conversations they created"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_members.conversation_id
      AND conversations.created_by = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, is_guest)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'is_guest')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();