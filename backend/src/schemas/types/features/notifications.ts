// 012_notifications.sql
// notifications

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'booking_request' | 'booking_confirmed' | 'review' | 'payment' | 'system';
  title: string;
  content: string;
  related_id: string;
  related_type: 'listing' | 'booking' | 'message';
}