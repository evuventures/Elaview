import { useState, useEffect } from 'react';
import { supabase } from '../utils/SupabaseClient';
import MessageBubble from './MessageBubble';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
};

type Conversation = {
  id: string;
  landlord_id: string;
  renter_id: string;
  unread_by_landlord: number;
  unread_by_renter: number;
};

type User = {
  id: string;
};

type Props = {
  conversation: Conversation;
  user: User;
};

export default function ChatPanel({ conversation, user }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      message_type: 'text',
      content: input,
    });

    const isLandlord = user.id === conversation.landlord_id;
    const updateField = isLandlord ? 'unread_by_renter' : 'unread_by_landlord';

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        [updateField]: (conversation as any)[updateField] + 1,
      })
      .eq('id', conversation.id);

    setInput('');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} user={user} />
        ))}
      </div>
      <div style={{ padding: '1rem', borderTop: '1px solid #ccc' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '80%' }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
