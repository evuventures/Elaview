import ConversationPreview from './ConversationPreview';

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
  conversations: Conversation[];
  user: User;
  onSelect: (convo: Conversation) => void;
};

export default function ConversationList({ conversations, user, onSelect }: Props) {
  return (
    <div style={{ width: '300px', borderRight: '1px solid #ccc' }}>
      {conversations.map((convo) => (
        <ConversationPreview
          key={convo.id}
          convo={convo}
          user={user}
          onClick={() => onSelect(convo)}
        />
      ))}
    </div>
  );
}


