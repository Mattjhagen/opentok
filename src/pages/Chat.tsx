import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  chat_id: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export default function Chat() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch other user's profile
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          toast({
            title: "Error",
            description: "User not found",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setOtherUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      }
    };

    fetchOtherUser();
  }, [userId, navigate, toast]);

  // Fetch or create chat and messages
  useEffect(() => {
    const fetchChatAndMessages = async () => {
      if (!currentUser || !userId) return;

      try {
        setLoading(true);
        
        // First, get or create a chat between the two users
        const { data: chatData, error: chatError } = await supabase
          .rpc('get_or_create_chat', {
            user1_id: currentUser.id,
            user2_id: userId
          });

        if (chatError) {
          console.error('Error getting/creating chat:', chatError);
          return;
        }

        setChatId(chatData);

        // Then fetch messages for this chat
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:profiles!chat_messages_sender_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('chat_id', chatData)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return;
        }

        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error fetching chat and messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatAndMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, userId, chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !chatId || sending) return;

    try {
      setSending(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage.trim(),
          sender_id: currentUser.id,
          chat_id: chatId
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  if (!userId) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-white">
                {otherUser.display_name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{otherUser.display_name || 'Unknown User'}</h1>
              <p className="text-sm text-muted-foreground">
                @{otherUser.username}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
