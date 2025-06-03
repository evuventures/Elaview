-- Payment Records
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  payer_id UUID REFERENCES user_profiles(id),
  recipient_id UUID REFERENCES user_profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_type ENUM('rental_fee', 'security_deposit', 'refund', 'penalty'),
  payment_method ENUM('credit_card', 'bank_transfer', 'paypal', 'stripe'),
  external_payment_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);