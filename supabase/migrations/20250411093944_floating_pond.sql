/*
  # Add attachment support to chat messages

  1. Changes to Existing Tables
    - Add `has_attachment` boolean column to `chat_messages`
    - Add `attachment_url` text column to `chat_messages`
    - Add `attachment_type` text column to `chat_messages`

  2. Security
    - Update RLS policies to handle attachments
*/

ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS has_attachment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_type text;

-- Update the existing policies to include new columns
DROP POLICY IF EXISTS "Users can read their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages" ON chat_messages;

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