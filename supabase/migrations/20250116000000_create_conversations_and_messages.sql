-- Migration: Create conversations and messages tables
-- Description: Initial schema for WhatsApp bot conversation tracking
-- Author: Inca London Dev Team
-- Date: 2025-01-16

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: conversations
-- Description: Tracks user conversations with their status and timestamps
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    started_at timestamptz NOT NULL DEFAULT now(),
    last_message_at timestamptz NOT NULL DEFAULT now(),

    -- Indexes for performance
    CONSTRAINT conversations_status_check CHECK (status = ANY (ARRAY['open'::text, 'closed'::text]))
);

-- Create index on user_phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_phone ON public.conversations(user_phone);

-- Create index on status and last_message_at for finding active conversations
CREATE INDEX IF NOT EXISTS idx_conversations_status_last_message ON public.conversations(status, last_message_at DESC);

-- ============================================================================
-- Table: messages
-- Description: Stores individual messages with direction, content, and status
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    wa_message_id text,
    direction text NOT NULL CHECK (direction IN ('in', 'out')),
    sender text NOT NULL CHECK (sender IN ('user', 'bot')),
    message_type text NOT NULL DEFAULT 'text',
    text_content text,
    created_at timestamptz NOT NULL DEFAULT now(),
    delivered_at timestamptz,
    read_at timestamptz,

    -- Foreign key constraint
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id)
        REFERENCES public.conversations(id) ON DELETE CASCADE,

    -- Check constraints
    CONSTRAINT messages_direction_check CHECK (direction = ANY (ARRAY['in'::text, 'out'::text])),
    CONSTRAINT messages_sender_check CHECK (sender = ANY (ARRAY['user'::text, 'bot'::text]))
);

-- Create index on conversation_id for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Create index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Create index on wa_message_id for WhatsApp message lookups
CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON public.messages(wa_message_id) WHERE wa_message_id IS NOT NULL;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Description: Security policies to control access to data
-- Note: Disabled by default for service role usage
-- ============================================================================

-- Enable RLS on tables (optional, can be enabled later)
-- ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
-- CREATE POLICY "Service role has full access to conversations"
--     ON public.conversations
--     FOR ALL
--     TO service_role
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Service role has full access to messages"
--     ON public.messages
--     FOR ALL
--     TO service_role
--     USING (true)
--     WITH CHECK (true);

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.conversations IS 'Stores WhatsApp conversation metadata for each user';
COMMENT ON COLUMN public.conversations.id IS 'Unique identifier for the conversation';
COMMENT ON COLUMN public.conversations.user_phone IS 'User''s WhatsApp phone number (WhatsApp ID)';
COMMENT ON COLUMN public.conversations.status IS 'Current status: open or closed';
COMMENT ON COLUMN public.conversations.started_at IS 'When the conversation was first created';
COMMENT ON COLUMN public.conversations.last_message_at IS 'Timestamp of the most recent message';

COMMENT ON TABLE public.messages IS 'Stores individual WhatsApp messages exchanged with users';
COMMENT ON COLUMN public.messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN public.messages.conversation_id IS 'Reference to the parent conversation';
COMMENT ON COLUMN public.messages.wa_message_id IS 'WhatsApp message ID from Meta API';
COMMENT ON COLUMN public.messages.direction IS 'Message direction: in (from user) or out (to user)';
COMMENT ON COLUMN public.messages.sender IS 'Who sent the message: user or bot';
COMMENT ON COLUMN public.messages.message_type IS 'Type of message: text, interactive, document, etc.';
COMMENT ON COLUMN public.messages.text_content IS 'Actual text content of the message';
COMMENT ON COLUMN public.messages.created_at IS 'When the message was created';
COMMENT ON COLUMN public.messages.delivered_at IS 'When the message was delivered (for outgoing messages)';
COMMENT ON COLUMN public.messages.read_at IS 'When the message was read';

-- ============================================================================
-- Sample Queries (for reference)
-- ============================================================================

-- Find all open conversations
-- SELECT * FROM conversations WHERE status = 'open' ORDER BY last_message_at DESC;

-- Get conversation history for a user
-- SELECT m.* FROM messages m
-- JOIN conversations c ON m.conversation_id = c.id
-- WHERE c.user_phone = '+1234567890'
-- ORDER BY m.created_at DESC
-- LIMIT 20;

-- Check if a user is new
-- SELECT COUNT(*) FROM conversations WHERE user_phone = '+1234567890';

-- Get message statistics
-- SELECT
--     sender,
--     COUNT(*) as message_count,
--     AVG(LENGTH(text_content)) as avg_length
-- FROM messages
-- GROUP BY sender;
