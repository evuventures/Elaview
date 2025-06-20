type Conversation = {
  id: string;
  subject: string;
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
  convo: Conversation;
  user: User;
  onClick: () => void;
};

export default function ConversationPreview({ convo, user, onClick }: Props) {
  const unread = user.id === convo.landlord_id ? convo.unread_by_landlord : convo.unread_by_renter;

  return (
    <div onClick={onClick} style={{ padding: '1rem', cursor: 'pointer' }}>
      <p><strong>{convo.subject}</strong></p>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        {convo.last_message_text || 'No messages yet'}
      </p>
      {unread > 0 && <p>{unread} unread</p>}
      <small>{new Date(convo.last_message_at).toLocaleString()}</small>
    </div>
  );
}

