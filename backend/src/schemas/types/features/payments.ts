// 011_payments.sql
// payment records

export interface Payment {
  id: string;
  booking_id: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  payment_type: 'rental_fee' | 'security_deposit' | 'refund' | 'penalty';
}