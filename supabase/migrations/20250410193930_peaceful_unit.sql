/*
  # Create chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text, either 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for authenticated users to:
      - Read their own messages
      - Create new messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  chat_id uuid REFERENCES chats(id),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
