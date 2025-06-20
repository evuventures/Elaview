import { useState, useEffect } from 'react';
import { supabase } from '../utils/SupabaseClient';
import ConversationList from '../components/ConversationList';
import ChatPanel from '../components/ChatPanel';

// Type definitions
type Conversation = {
  id: string;
  subject: string;
  listing_id: string;
  last_message_at: string;
  landlord_id: string;
  renter_id: string;
  unread_by_landlord: number;
  unread_by_renter: number;
  last_message_text: string;
};

type User = {
  id: string;
};

type Props = {
  user: User;
};

export default function MessagingPage({ user }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          subject,
          listing_id,
          last_message_at,
          landlord_id,
          renter_id,
          unread_by_landlord,
          unread_by_renter,
          last_message_text
        `)
        .or(`landlord_id.eq.${user.id},renter_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
    
      if (!error && data) {
        setConversations(data as Conversation[]);
      }
    };
    

    loadConversations();
  }, [user]);

  // UI section
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ConversationList
        conversations={conversations}
        user={user}
        onSelect={(convo: Conversation) => setSelectedConvo(convo)}
      />
      {selectedConvo && <ChatPanel conversation={selectedConvo} user={user} />}
    </div>
  );
}
