-- Ensure chats table exists
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participants UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure chat_messages table exists
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tables if not already enabled
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- RLS Policies for chats
CREATE POLICY "Users can view chats they participate in" 
ON public.chats 
FOR SELECT 
USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update chats they participate in" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() = ANY(participants));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chats" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE id = chat_id 
    AND auth.uid() = ANY(participants)
  )
);

CREATE POLICY "Users can send messages in their chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.chats 
    WHERE id = chat_id 
    AND auth.uid() = ANY(participants)
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages (chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at);
