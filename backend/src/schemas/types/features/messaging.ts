// 006_conversations.sql
// conversations and messages

export interface Conversation {
  id: string;
  listing_id: string;
  landlord_id: string;
  renter_id: string;
  subject: string;
  status: 'active' | 'archived' | 'blocked' | 'resolved';
  last_message_at: string;
}

// 007_messages.sql

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}