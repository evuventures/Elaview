type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type User = {
  id: string;
};

type Props = {
  message: Message;
  user: User;
};

export default function MessageBubble({ message, user }: Props) {
  const isOwn = message.sender_id === user.id;

  return (
    <div style={{ textAlign: isOwn ? 'right' : 'left', margin: '0.5rem 0' }}>
      <div
        style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: isOwn ? '#daf1ff' : '#eee',
          borderRadius: '12px',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
