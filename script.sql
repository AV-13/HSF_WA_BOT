-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.conversations (
                                      id uuid NOT NULL DEFAULT gen_random_uuid(),
                                      user_phone text NOT NULL,
                                      status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'closed'::text])),
                                      started_at timestamp with time zone NOT NULL DEFAULT now(),
                                      last_message_at timestamp with time zone NOT NULL DEFAULT now(),
                                      CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
                                 id uuid NOT NULL DEFAULT gen_random_uuid(),
                                 conversation_id uuid NOT NULL,
                                 wa_message_id text,
                                 direction text NOT NULL CHECK (direction = ANY (ARRAY['in'::text, 'out'::text])),
                                 sender text NOT NULL CHECK (sender = ANY (ARRAY['user'::text, 'bot'::text])),
                                 message_type text NOT NULL DEFAULT 'text'::text,
                                 text_content text,
                                 created_at timestamp with time zone NOT NULL DEFAULT now(),
                                 delivered_at timestamp with time zone,
                                 read_at timestamp with time zone,
                                 CONSTRAINT messages_pkey PRIMARY KEY (id),
                                 CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);